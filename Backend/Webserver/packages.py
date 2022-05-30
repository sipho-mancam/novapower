from CONSTANTS import *

class Package:
    def __init__(self, _obj:dict=None) -> None:
        self._obj = _obj
        self.__total_price = 0
        if _obj is not None:
            keys = _obj.keys()
            self.__total_price = 0
            for i in _obj.values():
                self.__total_price += i.get_price()



def generate_packages(components:dict):
    if components is not None:
        keys_len = len(components.keys())

        for i in range(keys_len):
            temp = {}
            


d  = {
    'name': 'Package',
    'price': 200,
    'other':{
        'size':1,
        'qty':2
    }
}

for i in d.values():
    print(i)
