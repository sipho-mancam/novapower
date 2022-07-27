# initialize the db
# initialize the flask webserver
# initialize package manager
# initialize the programms main class - Entry points
# initialize the kafka connector
# set up the validator  qw

# import Modules.input_drivers.mongo_broker as mongo_broker
import Modules.Utils.utility as utility
import Modules.input_drivers.package_manager as pm
import Modules.input_drivers.excel_driver as exd


def setup_input(xl_path, sheet_name, keys=[]):
    data = exd.xl_to_json(xl_path, sheet=sheet_name) 
    d_table = None;

    if len(keys)>0:
        d_table = utility.parse_json(data, keys=keys)
    else: 
        d_table = utility.parse_json(data)

    package_handler = pm.PackageHandler(d_table)

    return package_handler
