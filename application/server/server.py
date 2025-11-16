from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn
from pydantic import BaseModel
from typing import Dict, Any

logging.basicConfig(filename='app.log', level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

frontend_port = 9002
PORT = 8000

origins = [
    f'http://localhost:{frontend_port}'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.get('/')
async def root():
    logger.info('[GET] /')
    return {'message': 'Connected'}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=PORT)