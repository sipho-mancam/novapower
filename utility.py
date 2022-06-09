import os
import pathlib
import json
from package_manager import *
from mongo_broker import *
import CONSTANTS


client = connect(host=CONSTANTS.D_HOST, port=CONSTANTS.D_PORT)
db_manager = DBManager(client, client[CONSTANTS.DB_TEST], CONSTANTS.COL_TEST, {})


def parse_json(data1, keys:list=[]):
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

def generate_mock_items(n = 1):
    l = list()
    c_list = ['solar', 'battery', 'inverter', 'charger', 'racking', 'cabling']
    if n > 1:
        for i in range(n):
            l.append(Item(
                _obj={
                CONSTANTS.ID: str(randbytes(32)),
                CONSTANTS.CLASS:choice(c_list),
                CONSTANTS.PRICE:random()*1000,
                CONSTANTS.IMG_URL:'https://some-image-server/'+str(randbytes(32)),
                CONSTANTS.OPTIONS:{}
                }
            ).to_dict())
        return l
    else:
        return Item(
                _obj={
                CONSTANTS.ID: str(randbytes(32)),
                CONSTANTS.CLASS:choice(c_list),
                CONSTANTS.PRICE:random()*1000,
                CONSTANTS.IMG_URL:'https://some-image-server/'+str(randbytes(32)),
                CONSTANTS.OPTIONS:{}
                }
            ).to_dict()