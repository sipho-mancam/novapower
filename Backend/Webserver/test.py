from package_manager import *
from mongo_broker import *
import CONSTANTS
from random import choice, randbytes, random

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

# def test_delete(filter={}):
    
items = generate_mock_items(100)
# item = generate_mock_items(1)

# test_write(item)
test_write(items, len(items))
print(p_manager.read_all(db_name=[CONSTANTS.DB_ITEMS], col_name=[CONSTANTS.COL_SOLAR]))

# print("All records: \n", p_manager.read_all())


