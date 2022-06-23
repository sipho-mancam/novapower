# initialize the db
# initialize the flask webserver
# initialize package manager
# initialize the programms main class - Entry points
# initialize the kafka connector
# set up the validator  qw

from mongo_broker import *
from package_manager import DBManager
import CONSTANTS
from utility import *
from packages import *
from excel_driver import *
import pprint


def setup_input(xl_path, sheet_name, keys=[]):
    data = xl_to_json(xl_path, sheet=sheet_name)
    d_table = None;
    
    if len(keys)>0:
        d_table = parse_json(data, keys=keys)
    else: 
        d_table = parse_json(data)
    package_handler = PackageHandler(d_table)

    return package_handler
