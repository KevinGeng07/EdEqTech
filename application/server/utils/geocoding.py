import os
from dotenv import load_dotenv
import requests

load_dotenv()

def get_latitude_longitude(place_id):
    url = str(os.getenv('GOOGLE_GEOCODING_API_URI'))
    params = {
        'place_id': place_id,
        'key': os.getenv('API_KEY')
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data["status"] != "OK":
        raise Exception(f"Geocoding API error: {data['status']} - {data.get('error_message')}")

    location = data["results"][0]["geometry"]["location"]
    lat = location["lat"]
    lng = location["lng"]

    return lat, lng