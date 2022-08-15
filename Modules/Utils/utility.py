import os
import pathlib
import json
import pprint
import Modules.input_drivers.db_manager as db_manager
import Modules.input_drivers.mongo_broker as mongo_broker
import Modules.Utils.CONSTANTS as CONSTANTS
import Modules.Processors.pricing as pricing

import sys

sys.path.append(pathlib.Path(__file__+'/../').resolve().__str__())
import init

client = mongo_broker.connect(host=CONSTANTS.D_HOST, port=CONSTANTS.D_PORT)
db_manager = db_manager.DBManager(client, client[CONSTANTS.DB_TEST], CONSTANTS.COL_TEST, {})

def search_cart(uid, cart_list):
    for item in cart_list:
        if item['_uid'] == uid:
            return item
    return None

def get_packages_data(keys=['solar', 'inverter', 'battery'])->dict:
    data_path = "./Data/DatabaseIndividualPricingInputFormat v2.xlsx"
    sbp_list = init.setup_input(data_path, 'Sheet 1', keys=['solar', 'inverter', 'battery']).get_sub_package_list()
    out = {}
    for sp in sbp_list:
        out[sp._get_name()] = sp._get_items()
    
    return out

def update_cart(uid:str, cart_list:list, func:str='increase'):
    res = search_cart(uid, cart_list)
    if res is not None:
        if func == 'increase':
            res['qty'] += 1
            return True
        elif func == 'decrease':
            res['qty'] -= 1
            if res['qty']<0:res['qty'] = 0
            return True
        elif func == 'delete':
            cart_list.remove(res)
            return True 
        else:
            res['qty'] = float(func)
            return True
    elif func == 'clear':
        cart_list.clear()       
    else: 
        return False;
    
def arrange_data_to_table(json_data:dict, keys:list=[]): # organise the data according to ... solar, inverter and battery , 
    d_table = {}
    if len(keys)>0:
        for k in keys:
            if k in json_data and len(json_data[k]):
                d_table[k] = json_data[k]
    else:
        for p in json_data:
            if len(json_data[p])>0:
                d_table[p] = json_data[p]
    return d_table
   

def read_json(path):
    if os.path.isfile(path):
        with open(path, 'r') as f:
            data = json.load(f)
        return data
    elif type(path) is str:
        p = pathlib.Path(path)
        return read_json(p)
    return None


def write_json(name, data={}):
    with open(name, 'w') as f:
        json.dump(data, f)
    


def test_read(filter={}, n=1):
    if len(filter)>=0:
        res = None
        if n == 1: res = db_manager._read_record(_query=filter)
        elif n>1: res = db_manager._read_records(_query=filter)


        if res is not None:
            print("[{}] Can read database from package manager",format('*'))
            print("\n{}".format(res))
            return res
        else:
            print("[x] Failing to read from database : result is {}".format(res))
        

def test_write(data={}, n=1):
    if len(data)>0:
        if n == 1:
            res = db_manager._insert_record(db=client[CONSTANTS.DB_ITEMS], collection=CONSTANTS.COL_SOLAR
                                            ,record=data)
        elif n>0:
            res = db_manager._insert_records(db=client[CONSTANTS.DB_ITEMS], collection=CONSTANTS.COL_SOLAR, records=data)

        if res is not None:
            print("[{tick}] Can write to database".format(tick='*'))
            print("\n{}".format(res))
        else:
            print("[x] Failed to write to db")


def format_price(price):
    s = "R {:,.2f}".format(price)
    return price

