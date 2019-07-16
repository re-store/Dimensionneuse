import json
from input_ import *

with open('../config/config.json') as json_data:
    global config
    config = json.load(json_data)
    json_data.close()

with open('../config/materials.json') as json_data:
    global materials
    materials = json.load(json_data)
    json_data.close()

print("La Dimensionneuse\nWelcome !")

