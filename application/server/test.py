from utils.geocoding import *
from utils.filter_dataset import *
from utils.matching import *

place_id = 'ChIJMSKJ1lzmj4ARV0D2joR8Mjs'

lat, lng = get_latitude_longitude(place_id)

df = retrieve_nn(10, lat, lng)

print(df)
params = {
    'place_id': 'ChIJMSKJ1lzmj4ARV0D2joR8Mjs',
    "Average Cost of Attendance": 54518.5,
    'Major': 'STEM',
    'Race': 'Asian'
}