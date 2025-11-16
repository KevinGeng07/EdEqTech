from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn
from pydantic import BaseModel
from typing import Dict, Any

from utils.filter_dataset import *
from utils.geocoding import *
from utils.matching import *
from utils.chatbot import *
from utils.image_scraper import *

logging.basicConfig(filename='app.log', level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

frontend_port = 9002
PORT = 8000

origins = [
    f"http://localhost:{frontend_port}",
    "http://127.0.0.1:9002"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.post('/get_ranking')
async def get_ranking(request: Dict[str, Any]):
    logger.info('[POST] /get_ranking')
    place_id, k = request['place_id'], request['k']
    lat, lng = get_latitude_longitude(place_id)

    df = retrieve_nn(k, lat, lng)


    if len(request) == 2:
        num_rows = df.shape[0]

        schools = df.sort_values(by='dist', ascending=False)['Institution Name_x'].values.tolist()
        img_urls = get_images(schools)

        response = {
            'location': {'lat': lat, 'lng': lng},
            'schools': schools,
            'similarities': (np.arange(start=1, stop=num_rows+1) / num_rows).tolist()[::-1],
            'schoolImageUrls': img_urls
        }

        return response

    param, columns, major, race = preprocess_parameters(request)
    parameter_arrays = create_parameter_arrays(df, columns, major, race)

    sim_normalized, sim = similarities(param, parameter_arrays)
    institutions, sim_scores = sort_by_similarity(df, sim_normalized)

    img_urls = get_images(institutions)

    response = {
        'location': {'lat': lat, 'lng': lng},
        'schools': institutions,
        'similarities': sim_scores,
        'schoolImageUrls': img_urls
    }

    return response

@app.post('/chat')
async def chat(request: Dict[str, Any]):
    logger.info('[POST] /chat')
    response, prompt = chat_with_ai(request)

    return {
        'message': response
    }


@app.get('/')
async def root():
    logger.info('[GET] /')
    return {'message': 'Connected'}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=PORT)