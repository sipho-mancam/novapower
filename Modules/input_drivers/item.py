import hashlib
import Modules.Utils.CONSTANTS as CONSTANTS
class Item:
    def __init__(self, id:str='', cl:str='', price:float=0.0, desc:str='', img_url:str='', 
                _obj:list|dict=None, **kwargs) -> None:
        self.__id = id
        self.__brand = cl
        self.__price = price
        self.__type = desc
        self.__img_url = img_url
        self.__options = dict()
        self.__obj_raw = _obj
        self.__size = {}
        self.__hashing_object = hashlib.md5(self.encode_for_hashing(self.__obj_raw.__str__()))
        self.__uid = ''
        self.update_hash()
        self.__obj_raw['_uid'] = self.__uid
        self.__qty = 1
        self.__name = ''
        
        if _obj is not None:
            if type(_obj) is dict:
                for _key in _obj.keys():
                    if _key == CONSTANTS.ID:
                        self.__id  = str(_obj[_key])
                    elif _key == CONSTANTS.BRAND:
                        self.__cl = _obj[_key]
                    elif _key == CONSTANTS.PRICE:
                        self.__price = _obj[_key]
                    elif _key == CONSTANTS.TYPE:
                        self.__type = _obj[_key]
                    elif _key == CONSTANTS.IMG_URL:
                        self.__img_url = _obj[_key]
                    elif _key == CONSTANTS.OPTIONS:
                        self.__options = _obj[_key]
                    elif _key == CONSTANTS.SIZE:
                        self.__size = _obj[_key]
                    elif _key == 'qty':
                        self.__qty = _obj['qty']
                    elif _key =='name':
                        self.__name = _obj[_key]


            elif type(_obj) is list and len(_obj)>=5:
                for pair in _obj:
                    _key, value = pair.split(':')
            elif type(_obj) is type(list()) and len(_obj)>=5:
                for pair in _obj:
                    _key, value = pair.split(':')

                    if _key == CONSTANTS.ID:
                        self.__id  = value
                    elif _key == CONSTANTS.CLASS:
                        self.__cl = value
                    elif _key == CONSTANTS.PRICE:
                        self.__price = value
                    elif _key == CONSTANTS.DESCRIPTION:
                        self.__description = value
                    elif _key is CONSTANTS.IMG_URL:
                        self.__img_url = value
                    elif _key is CONSTANTS.OPTIONS:
                        self.__options = value


    def encode_for_hashing(self, s:str):
        return bytes(s, 'utf-8')
    
    def update_hashing_string(self, s:str):
        st = self.encode_for_hashing(s)
        self.__hashing_object.update(st)
        self.update_hash()

    def get_name(self):return self.__name
    def get_qty(self):return self.__qty
    def set_qty(self, n):
        self.__qty = n
        self.__obj_raw['qty'] = self.__qty

    def update_hash(self):
       self.__uid = self.__hashing_object.hexdigest()

    def get_price(self):return self.__price
    
    def get_size(self):return self.__size

    def to_dict(self)->dict:
        return self.__obj_raw
        
    def to_json(self)->str:
        return str(self.to_dict())
    
    # property control functions
    def __str__(self):
        return self.to_json()

    def __eq__(self, __o:object) -> bool:
        return self.__price ==  __o.__price

    def __lt__(self, __o:object) -> bool:
        return self.__price <  __o.__price

    def __gt__(self, __o:object) -> bool:
        return self.__price >  __o.__price

    def __ge__(self, __o:object)->bool:
        return self.__price >=  __o.__price
    
    def __le__(self, __o:object)-> bool:
        return self.__price <=  __o.__price
    
    def __add__(self, __o:object)->int:
        return self.__price + __o.__price
    
    def __sub__(self, __o:object)->int:
        return self.__price - __o.__price


