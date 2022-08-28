from Modules.input_drivers.db_manager import *
from Modules.input_drivers.mongo_broker import *
import Modules.Utils.CONSTANTS as CONSTANTS
from random import choice, randbytes, random
import json
from Modules.input_drivers.package_manager import *
from Modules.Utils.utility import *
from Modules.Utils.init import *
import pprint
# db_manager, client = setup()

data_path = './input-data-1.xlsx'

solar_package_handler = setup_input(data_path, 'Sheet1', keys=['solar', 'inverter', 'battery']);
inverter_package_handler = setup_input(data_path, 'Sheet1', keys=['inverter', 'battery' ])
# generator_package_handler = setup_input(data_path,'Sheet1', keys=['generator'])


solar_package_handler.generate_package(10)
inverter_package_handler.generate_package(10)
# generator_package_handler.generate_package(10)

package_table = {
    # 'generator':generator_package_handler.get_summary(),
    'solar':solar_package_handler.get_summary(),
    'inverter':inverter_package_handler.get_summary()
}

write_json('package-debug.json', package_table)