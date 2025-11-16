import os
from dotenv import load_dotenv
import requests  

load_dotenv()    # <-- replace

def get_first_image_src(query):
    url = str(os.getenv('GOOGLE_SEARCH_API_URI'))
    params = {
        "q": query,
        "cx": os.getenv('CSE_ID'),
        "key": os.getenv('API_KEY'),
        "searchType": "image",
        "num": 1
    }

    res = requests.get(url, params=params).json()

    if "items" in res:
        return res["items"][0]["link"]   # direct image URL

    return 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM='


def get_images(schools):
    urls = []
    for school in schools:
        urls.append(get_first_image_src(school))
    
    return urls
