from package_manager import *
from mongo_broker import *
import CONSTANTS
from random import choice, randbytes, random
import json
from packages import *
from utility import *
from init import *
import pprint
# db_manager, client = setup()

data_path = './input-data-1.xlsx'

solar_package_handler = setup_input(data_path, 'Sheet1', keys=['solar', 'inverter', 'battery', 'cable', 'rack']);
inverter_package_handler = setup_input(data_path, 'Sheet1', keys=['inverter', 'battery', 'cable',])
generator_package_handler = setup_input(data_path,'Sheet1', keys=['generator'])


solar_package_handler.generate_package(10)
inverter_package_handler.generate_package(10)
generator_package_handler.generate_package(10)

package_table = {
    'generator':generator_package_handler.get_summary(),
    'solar':solar_package_handler.get_summary(),
    'inverter':inverter_package_handler.get_summary()
}

write_json('package-debug.json', package_table)