from package_manager import *
from mongo_broker import *
import CONSTANTS
from random import choice, randbytes, random
import json
from packages import *
from utility import *

result = pHandler.generate_package(50)

final_json = {}

# print(pHandler.get_summary())

with open('packages5.json', 'w') as write_file:
    json.dump(pHandler.get_summary(), write_file)


# for package in result:
    # print(package.get_summary())

# print(result)

