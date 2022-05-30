from pymongo import MongoClient
import pymongo
from pymongo.collection import Collection
from pymongo.database import Database


# 1) Read one item from the database
# 2) Read Many items from the db
# 3) insert one item to the db
# 4) insert many items into the db
# 5) Update one item in the db
# 6) Update many items in the db

def connect(host, port):
    print("[+] Connecting to db ...")
    client = None
    try:
        client = MongoClient(host, port)
        print("[+] Connected to database on {host}:{port}".format(host=host, port=port))
    except pymongo.errors.ConnectionError as e:
        print("[x] Failed to connect to db")
        print("\n\n\n{error}".format(error=e))
    finally:
        return client

def get_db_instance(client:MongoClient=None, db_name:str=''):
    if client is None:
        raise pymongo.error.PyMongoError
        return
    return client[db_name]

def read_record(_db:Database, _collection:Collection|str, _schema:dict|str)->dict:
        col = _db[_collection]
        return col.find_one(_schema)

def read_records(_db:Database, _collection:str|Collection, _schema:str|dict={}):
    col = _db[_collection]
    return col.find(_schema)

def insert_record(_db:Database, _collection:str|dict, _document:dict={}):
    if len(_document) == 0:
        return
    print("Collection is {}: db is {}".format(_collection, _db))
    return _db[_collection].insert_one(_document)

def insert_records(_db:Database, _collection:str|Collection, _documents:list):
    if len(_documents) == 0:
        print("[x] Add documents to insert to the database")
        return
    return _db[_collection].insert_many(_documents)

def update_record(_db:Database, _collection:str,_filter:dict, _u_document:dict):
    if len(_u_document) == 0:
        print("[x] Error! Add the document to update")
        return
    return _db[_collection].update_one(_filter,_u_document, True)

def update_records(_db:Database, _collection:str,_filter:dict, _u_documents:list):
    if len(_u_documents) == 0:
        print("[x] Error! Add the documents to update")
        return _db[_collection].update_many(_filter,_u_documents, True)

def delete_record(_db:Database,_collection:str, _filter:dict):
    return _db[_collection].delete_one(_filter)

def delete_records(_db:Database,_collection:str, _filter:dict):
    return _db[_collection].delete_many(_filter)



if __name__ == "__main__":
    pass

