from CONSTANTS import *
from item import *
from random import *
import json
from package_manager import *

class Package:
    def __init__(self, _obj:dict=None) -> None:
        self._obj = _obj
        self.__total_price = 0
        self.__items_list = []
    
    def add_item(self, item):
        self.__items_list.append(item)
        self.__total_price = self._gen_total()
    
    def _gen_total(self):
        s = self.__items_list[0].get_price()
        for item in self.__items_list:
            s += item.get_price()
        return (s - self.__items_list[0].get_price())
    
    def get_summary(self):
        counter = 0
        d = dict()
        for i in self.__items_list:
            d['item '+str(counter)] = i.to_dict()
            counter += 1
        d['total-price'] = self.__total_price
        return d
    
    # def __str__(self):
    #     return str([
    #         i.to_json() for i in self.__items_list
    #     ])
    
        

class Subpackage:
    def __init__(self, items:list=[]):
        self.__items = items
        self.__current_count = 0
        self.__current_item = self.__items[0]
        self.__next_package = None
        self.__index = 0
        self.__change_flag = False
    
    def _get_items(self):return self.__items
    def _set_items(self, items_list):self.__items = items_list
    def _get_current_count(self):return self.__current_count
    def _get_current_item(self):return self.__current_item
    
    def next(self):
        self.__current_count += 1
        self.__current_item = self.__items[self.__current_count]
        return self.__current_item

    def prev(self):
        self.__current_count -= 1
        if self.__current_count > 0:
            self.__current_item = self.__items[self.__current_count]
    
    def _get_next(self):
        return self.__next_package

    def _append_next(self, sub_p):
        sub_p.__index = self.__index+1
        self.__next_package = sub_p

    def is_end(self):return self.__current_count == (len(self.__items)-1)
    def is_last(self):return self.__next_package == None
    def is_first(self): return self.__index == 0

    def reset(self):
        self.__current_count = 0
        if self.__next_package is not None:
            self.__next_package.reset()
        return

    def pack(self, package):
        package.add_item(self._get_current_item()) # append my current element
        if not self.is_last():
            res = self.__next_package.pack(package)
            if res: # you are supposed to change...
                if not self.is_end(): 
                    self.next()
                    return False
                else:
                    self.reset()
                    return True
            return res
        else:  # if it is the last object
            if self.is_end():
                self.reset()
                self.__change_flag = True
                return self.__change_flag
            else:
                self.next()
                return False


        
class PackageHandler:
    def __init__(self, _sub_packages:dict=None):
        self.__sub_packages_list = list()
        self.__packages = list()
        self.__package_count = 0
        if _sub_packages is not None:
            self.__populate_sub_p(_sub_packages)

    def get_summary(self):
        d = dict()
        counter = 0
        for p in self.__packages:
            d['packag '+str(counter)]=p.get_summary()
            counter+=1
        return d

    def __append_sub(self, sub_p:Subpackage):
        if sub_p not in self.__sub_packages_list:
            self.__sub_packages_list[len(self.__sub_packages_list)-1]._append_next(sub_p)
            self.__sub_packages_list.append(sub_p)

    def __populate_sub_p(self, subs:dict):
        for i in subs.values():
            temp = Subpackage(i)
            self.__sub_packages_list.append(temp)
        self.__link_list()
    
    def __link_list(self):
        if len(self.__sub_packages_list)>=2:
            for i in range(len(self.__sub_packages_list)):
                try:
                    self.__sub_packages_list[i]._append_next(self.__sub_packages_list[i+1])
                except IndexError:
                    return
        
    def generate_package(self, n):
        first_sub = self.__sub_packages_list[0]
        for i in range(n):
            temp = Package()
            first_sub.pack(temp)
            self.__package_count +=1
            self.__packages.append(temp)
        
        return self.__packages
           

# def generate_mock_items(n = 1):
#     l = list()
#     res = dict()
#     c_list = ['solar', 'battery', 'inverter', 'charger', 'racking', 'cabling']
#     if n > 1:
#         for i in c_list:
#             l = list()
#             for j in range(10):
#                 l.append(Item(
#                     _obj={
#                     CONSTANTS.ID: str(random()),
#                     CONSTANTS.CLASS:i,
#                     CONSTANTS.PRICE:random()*1000,
#                     CONSTANTS.IMG_URL:'https://some-image-server/'+str(random()),
#                     CONSTANTS.OPTIONS:{}
#                     }))
#             res[i] = l
#         return res
#     else:
#         return Item(
#                 _obj={
#                 CONSTANTS.ID: str(randbytes(32)),
#                 CONSTANTS.CLASS:choice(c_list),
#                 CONSTANTS.PRICE:random()*1000,
#                 CONSTANTS.IMG_URL:'https://some-image-server/'+str(randbytes(32)),
#                 CONSTANTS.OPTIONS:{}
#                 }
#             ).to_dict()



