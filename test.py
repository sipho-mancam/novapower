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

solar_package_handler = setup_input('./formatted-input-1.xlsx', 'Sheet1', keys=['solar', 'inverter', 'battery', 'cable', 'rack']);
inverter_package_handler = setup_input('./input-data.xlsx', 'Sheet1', keys=['inverter', 'battery', 'cable',])
generator_package_handler = setup_input('./input-data.xlsx','Sheet1', keys=['generator'])


solar_package_handler.generate_package(15)
inverter_package_handler.generate_package(15)
generator_package_handler.generate_package(3)

package_table = {
    'generator':generator_package_handler.get_summary(),
    'solar':solar_package_handler.get_summary(),
    'inverter':inverter_package_handler.get_summary()
}

# pprint.pprint(package_table)
