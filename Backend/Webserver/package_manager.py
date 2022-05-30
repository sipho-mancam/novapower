from sre_constants import ANY
from mongo_broker import *
from item import Item


class PManager:
    def __init__(self,client, db=None, collection=None, query=None) -> None:
        self.__h_client = client
        self.__db=db
        self.__collection = collection
        self.__query=query

    def _set_query(self, value:dict):
        self.__query = value
    
    def _set_collection(self, value:str):
        self.__collection = value

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

    def _insert_record(self, db=None, collection=None, record:Item|dict={}):
        if db is None or collection is None:
            return self._insert_record(self.__db, self.__collection, record)

        if type(record) is dict:
            return insert_record(db, collection, record)
        else:
            return insert_record(db, collection, self.parse_input(record))

    def _insert_records(self, db=None, collection=None, records:list[dict]|list[Item]=None):
        if db is None or collection is None:
            return self._insert_records(self.__db, self.__collection, records)
        return insert_records(db, collection, records)

    def _delete_record(self, db=None, collection=None, _query={}):
        return delete_record(db, collection, _query)
    
    def _delete_records(self, db=None, collection=None, records:list=None):
        return delete_records(db, collection, records)


    def parse_record(self, record:dict) -> Item:
        return Item(_obj=record)
    
    def parse_input(self, record:Item)->dict:
        return record.to_dict()
    


# create a package Object...
# create a package table object
# take in list inputs of objects and iterate through them to 
# to generate package of objects from them
# sort packages according to small - big
# generate a json objects from package list..

# write a js script to interact with the server, 
# generate views and 