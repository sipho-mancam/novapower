
import enum
import CONSTANTS



class Item:
    def __init__(self, id:str='', cl:str='', price:float=0.0, desc:str='', img_url:str='', 
                _obj:list|dict=None, **kwargs) -> None:
    
        self.__id = id
        self.__cl = cl
        self.__price = price
        self.__description = desc
        self.__img_url = img_url
        self.__options = dict()

        if _obj is not None:
            if type(_obj) is dict:
                for _key in _obj.keys():
                    if _key == CONSTANTS.ID:
                        self.__id  = _obj[_key]
                    elif _key == CONSTANTS.CLASS:
                        self.__cl = _obj[_key]
                    elif _key == CONSTANTS.PRICE:
                        self.__price = _obj[_key]
                    elif _key == CONSTANTS.DESCRIPTION:
                        self.__description = _obj[_key]
                    elif _key is CONSTANTS.IMG_URL:
                        self.__img_url = _obj[_key]
                    elif _key is CONSTANTS.OPTIONS:
                        self.__options = _obj[_key]

            elif type(_obj) is list and len(_obj)>=5:
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



    def to_dict(self)->dict:
        return{
            CONSTANTS.ID:self.__id,
            CONSTANTS.CLASS:self.__cl,
            CONSTANTS.PRICE:self.__price,
            CONSTANTS.DESCRIPTION:self.__description,
            CONSTANTS.IMG_URL:self.__img_url,
            CONSTANTS.OPTIONS:self.__options
        }
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


