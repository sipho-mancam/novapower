from sre_constants import ANY

from numpy import record
from mongo_broker import *
from item import Item
import CONSTANTS

class DBManager:
    def __init__(self,client, db=None, collection=None, query=None) -> None:
        self.__h_client = client
        self.__db=db
        self.__collection = collection
        self.__query=query
        self.__collection_registery = list()
        self.__db_registery = list()

        self.__db_registery.append(db)
        print("[+] Initialising DB manager ...")

    def register_collection(self, collection_name:str, db)->None:
        if collection_name in self.__collection_registery:return
        else: self.__collection_registery.append(collection_name)
    
    def register_db(self, db):
        if db.name in self.__db_registery:return
        else: self.__db_registery.append(db)
    


    def _set_query(self, value:dict):
        self.__query = value
    
    def _set_collection(self, value:str):
        self.__collection = value

    def _get_client(self):
        return self.__h_client
    
    def get_current_db(self):return self.__db
    def get_current_collection_name(self):return self.__collection

    def _read_record(self, db=None,collection=None, _query=ANY)->Item:
        if db is None or collection is None:
            return read_record(self.__db, self.__collection, self.__query)
        return self.parse_record(read_record(db, collection, _query))
    
    def _read_records(self, db=None,collection=None,_query=ANY)->list[Item]:
        records = None
        r_list = list()
        
        if db is None or collection is None:
            return self._read_records(self.__db, self.__collection, self.__query)
        
        records = read_records(db, collection, _query)
        for record in records:
            r_list.append(self.parse_record(record))
        return r_list

    def read_all(self, db_name:list=None, col_name:list=None):
        res = {}
        if db_name is None:
            for db in self.__db_registery:
                res[db.name] = {}
                for c in db.list_collection_names():
                    temp = self._read_records(db, c, {})
                    res[db.name][c] = temp
            return res 
        else:
            for db in self.__db_registery:
                if db.name in db_name:
                    res[db.name]={}
                    
                    for c in db.list_collection_names():
                        if col_name is not None: 
                            if c in col_name :
                                temp = self._read_records(db, c, {})
                                res[db.name][c] = temp
                        elif col_name is None:
                            temp = self._read_records(db, c, {})
                            res[db.name][c] = temp
            return res 

    def _insert_record(self, db=None, collection=None, record:Item|dict={}):
        if db is None or collection is None:
            return self._insert_record(self.__db, self.__collection, record)

        self.register_db(db)
        if type(record) is dict:
            return insert_record(db, collection, record)
        else:
            return insert_record(db, collection, self.parse_input(record))

    def _insert_records(self, db=None, collection=None, records:list[dict]|list[Item]=None):
        if db is None or collection is None:
            return self._insert_records(self.__db, self.__collection, records)
        self.register_db(db)
        return insert_records(db, collection, records)

    def _delete_record(self, db=None, collection=None, _query={}):
        if db is None:
            return delete_record(self.__db, self.__collection, _query)
        else:
            return delete_record(db, collection, _query)
    
    def _delete_records(self, db=None, collection=None, records:list=None):
        if db is None:
            return delete_records(self.__db, self.__collection, record)
        else:
            return delete_records(db, collection, records)


    def parse_record(self, record:dict) -> Item:
        return Item(_obj=record)
    
    def parse_input(self, record:Item)->dict:
        return record.to_dict()
    

def setup():
    db_list = [
        CONSTANTS.DB_ITEMS,
        CONSTANTS.DB_ORDERS,
        CONSTANTS.DB_USERS
    ]
    client = connect(CONSTANTS.D_HOST)
    # print(client['quotes'])
    db_manager = DBManager(client, client['quotes'], 'user-quotes', {})

    for db_name in db_list:
        db_manager.register_db(client[db_name])   
    return db_manager, client

