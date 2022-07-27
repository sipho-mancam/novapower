# initialize the db
# initialize the flask webserver
# initialize package manager
# initialize the programms main class - Entry points
# initialize the kafka connector
# set up the validator  qw

from Modules.input_drivers.mongo_broker import *
import CONSTANTS
import utility 
from input_drivers.package_manager import *
from input_drivers.excel_driver import *


def setup_input(xl_path, sheet_name, keys=[]):
    data = xl_to_json(xl_path, sheet=sheet_name) 
    d_table = None;

    if len(keys)>0:
        d_table = utility.parse_json(data, keys=keys)
    else: 
        d_table = utility.parse_json(data)

    package_handler = PackageHandler(d_table)

    return package_handler
