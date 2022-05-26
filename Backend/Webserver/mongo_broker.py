from pymongo import MongoClient
import pymongo
import item
from pymongo.collection import Collection
from pymongo.database import Database

HOST = 'localhost'
PORT = 27017

def connect(host, port):
    print("[+] Connecting to db ...")
    client = None
    try:
        client = MongoClient(host, port)
        print("[+] Connected to database on {host}:{port}".format(host=host, port=port))
    except pymongo.errors.ConnectionError as e:
        print("[x] Failed to connect to db")
        print("\n\n\n{error}".format(error=e))
    
    return client


def get_db_instance(client:MongoClient=None, db_name:str=''):
    if client is None:
        raise pymongo.error.PyMongoError
        return
    return client[db_name]


def read_record(_db:Database=None, _collection:Collection=None):
    if _db is not None or _collection is not None:
        pass


# 1) Read one item from the database
# 2) Read Many items from the db
# 3) insert one item to the db
# 4) insert many items into the db
# 5) Update one item in the db
# 6) Update many items in the db




if __name__ == "__main__":
    pass

