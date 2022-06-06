

from curses import meta


class Schema:
    def __init__(self, _schema:dict) -> None:
        self.schema = _schema

class MetaSchema(Schema):
    def __init__(self, _schema: dict) -> None:
        super().__init__(_schema)



class DataObject:
    def __init__(self, meta_data:dict=None, name:str=None, _id:str=None, _obj:dict=None) -> None:
        self.meta_data = meta_data
        self.name = name
        self._id = _id
        
        if _obj is not None:
            keys = _obj.keys()
            for _i in keys:
                if _i == '_id':
                    self._id = _obj[_i]
                elif _i == 'name':
                    self.name = _obj[_i]
                elif _i == 'meta-data':
                    self.meta_data = _obj[_i]

    def get_metadata(self):return self.meta_data
    def get_name(self):return self.name
    def get_id(self):return self._id
    def get_data(self)->dict:return {}
    def parse_to_json(self)->dict:return {}


class Package(DataObject):
    def __init__(self, meta_data: dict = None, name: str = None, _id: str = None, _obj: dict = None) -> None:
        if meta_data is not None:
            super().__init__(meta_data, name, _id, _obj)
            self.json_data = {
                'meta-data':meta_data
            }



