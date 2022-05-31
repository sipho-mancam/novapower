from package_manager import *
from mongo_broker import *
import CONSTANTS
from random import choice, randbytes, random
import json
from packages import *

client = connect(host=CONSTANTS.D_HOST, port=CONSTANTS.D_PORT)

p_manager = PManager(client, client[CONSTANTS.DB_TEST], CONSTANTS.COL_TEST, {})


def test_read(filter={}, n=1):
    if len(filter)>=0:
        res = None
        if n == 1: res = p_manager._read_record(_query=filter)
        elif n>1: res = p_manager._read_records(_query=filter)


        if res is not None:
            print("[{}] Can read database from package manager",format('*'))
            print("\n{}".format(res))
            return res
        else:
            print("[x] Failing to read from database : result is {}".format(res))
        

def test_write(data={}, n=1):
    if len(data)>0:
        if n == 1:
            res = p_manager._insert_record(db=client[CONSTANTS.DB_ITEMS], collection=CONSTANTS.COL_SOLAR
                                            ,record=data)
        elif n>0:
            res = p_manager._insert_records(db=client[CONSTANTS.DB_ITEMS], collection=CONSTANTS.COL_SOLAR, records=data)

        if res is not None:
            print("[{tick}] Can write to database".format(tick='*'))
            print("\n{}".format(res))
        else:
            print("[x] Failed to write to db")


# def generate_mock_items(n = 1):
#     l = list()
#     c_list = ['solar', 'battery', 'inverter', 'charger', 'racking', 'cabling']
#     if n > 1:
#         for i in range(n):
#             l.append(Item(
#                 _obj={
#                 CONSTANTS.ID: str(randbytes(32)),
#                 CONSTANTS.CLASS:choice(c_list),
#                 CONSTANTS.PRICE:random()*1000,
#                 CONSTANTS.IMG_URL:'https://some-image-server/'+str(randbytes(32)),
#                 CONSTANTS.OPTIONS:{}
#                 }
#             ).to_dict())
#         return l
#     else:
#         return Item(
#                 _obj={
#                 CONSTANTS.ID: str(randbytes(32)),
#                 CONSTANTS.CLASS:choice(c_list),
#                 CONSTANTS.PRICE:random()*1000,
#                 CONSTANTS.IMG_URL:'https://some-image-server/'+str(randbytes(32)),
#                 CONSTANTS.OPTIONS:{}
#                 }
#             ).to_dict()

# def test_delete(filter={}):

data = None
with open('data.json', 'r') as jsonfile:
    data = json.load(jsonfile)



def parse_json(data1):
    l = list()
    d_table = dict()
    for items in data1:
        d_table[items] = list()
        for item in data[items]:
            d_table[items].append(p_manager.parse_record(item))
    return d_table

print(data)

d_table = parse_json(data)


pHandler = PackageHandler(d_table)

result = pHandler.generate_package(350)

final_json = {}

# print(pHandler.get_summary())

with open('packages2.json', 'w') as write_file:
    json.dump(pHandler.get_summary(), write_file)


# for package in result:
    # print(package.get_summary())

# print(result)

