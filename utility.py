import os
import pathlib
import json
from package_manager import *
from mongo_broker import *
import CONSTANTS
from pricing import *

client = connect(host=CONSTANTS.D_HOST, port=CONSTANTS.D_PORT)
db_manager = DBManager(client, client[CONSTANTS.DB_TEST], CONSTANTS.COL_TEST, {})

def search_cart(uid, cart_list):
    for item in cart_list:
        if item['_uid'] == uid:
            return item
    return None

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
    elif func == 'clear':
        cart_list.clear()       
    else: 
        return False;
    



def parse_json(data1, keys:list=None): # organise the data according to ... solar, inverter and battery , etc
    l = list()
    d_table = dict()
    if keys is not None:
        for pack in data1.keys():
            if pack in keys:
                if len(data1[pack])>0:
                    d_table[pack] = list()
                    for item in data1[pack]: 
                        temp = db_manager.parse_record(item)
                        d_table[pack].append(temp)
        return d_table
    else:
        for pack in data1.keys():      
                if len(data1[pack])>0:
                    d_table[pack] = list()
                    for item in data1[pack]: 
                        temp = db_manager.parse_record(item)
                        d_table[pack].append(temp)
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

