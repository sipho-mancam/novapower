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
    if db_name == '':
        print('[x] please enter a database name.')
        return
    return client[db_name]

def read_record(_db:Database=None, _collection:Collection=None):
    if _db is not None or _collection is not None:
        record = 

if __name__ == "__main__":
    pass

