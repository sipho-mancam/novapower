from CONSTANTS import *
from item import *
from random import *
import json
from package_manager import *
<<<<<<< HEAD
=======
import hashlib
>>>>>>> dev-web-server

class Package:
    def __init__(self, _obj:dict=None) -> None:
        self._obj = _obj
        self.__total_price = 0
        self.__items_list = []
<<<<<<< HEAD
    
    def add_item(self, item):
        self.__items_list.append(item)
        self.__total_price = self._gen_total()
=======
        self.__hashing_object = hashlib.sha256(usedforsecurity=True)
        self.__uid = self.__hashing_object.hexdigest()
        self.__max_power = 0
        self.__solar_qty = 0

    
    def add_item(self, item):
        self.__items_list.append(item)
        self.solar_qty()
        self.__total_price = self._gen_total()
        self.__hashing_object.update(self.encode_for_hashing(str(self.__total_price)))
        self.__hashing_object.update(self.encode_for_hashing(self.get_summary().__str__()))
        self.update_hash()
    
    def calc_max_power(self):
        for i in self.__items_list:
            if i.get_name().lower() == 'inverter':
                temp = i.get_size()
                # print(temp)
                if 'Power' in temp:
                    power = temp['Power']['value']
                    self.__max_power = power
    
    def solar_qty(self):
        self.calc_max_power()
        for i in self.__items_list:
            if i.get_name().lower() == 'solar':
                qty = (self.__max_power*1000)//i.get_size()['Power']['value']
                self.__solar_qty = qty
                # print('qty: {} max_power: {}'.format(i.to_dict(), self.__max_power))
                return


    def encode_for_hashing(self, s:str):
        return bytes(s, 'utf-8')
    
    def update_hashing_string(self, s:str):
        st = self.encode_for_hashing(s)
        self.__hashing_object.update(st)
        self.update_hash()


    def update_hash(self):
        self.__uid = self.__hashing_object.hexdigest()
>>>>>>> dev-web-server
    
    def _gen_total(self):
        s = self.__items_list[0].get_price()
        for item in self.__items_list:
<<<<<<< HEAD
            s += item.get_price()
=======
            if item.get_name() == 'solar':
                s+= item.get_price()*self.__solar_qty
            else:
                s += item.get_price()

>>>>>>> dev-web-server
        return (s - self.__items_list[0].get_price())
    
    def get_summary(self):
        counter = 0
        d = dict()
        for i in self.__items_list:
            d['item '+str(counter)] = i.to_dict()
            counter += 1
        d['total-price'] = self.__total_price
<<<<<<< HEAD
=======
        d['_uid'] = self.__uid
        d['max-power'] = self.__max_power
        d['solar-qty'] = self.__solar_qty
>>>>>>> dev-web-server
        return d
    
        

class Subpackage:
<<<<<<< HEAD
    def __init__(self, items:list=[]):
=======
    def __init__(self, items:list=[]): # items in this list are already parsed into local Item objects.
>>>>>>> dev-web-server
        self.__items = items
        self.__current_count = 0
        self.__current_item = self.__items[0]
        self.__next_package = None
        self.__index = 0
        self.__change_flag = False
<<<<<<< HEAD
=======
        self.__max_items = len(self.__items)
        self.__name = None
        self.__organised_data_structure = {}  # this structure sorts the data according to the 
        self.__current_list = []
        self.__current_list_index = 0
        
        # print("Items in subpackage:\n",items)
>>>>>>> dev-web-server
    
    def _get_items(self):return self.__items
    def _set_items(self, items_list):self.__items = items_list
    def _get_current_count(self):return self.__current_count
<<<<<<< HEAD
    def _get_current_item(self):return self.__current_item
    
    def next(self):
        self.__current_count += 1
        self.__current_item = self.__items[self.__current_count]
        return self.__current_item

=======
    def _get_current_item(self):return self.__items[self.__current_count]
    def _get_item_count(self):return self.__max_items 

    def _set_name(self, name:str):
        self.__name = name
        if name =='solar' or name=='inverter' or name=='battery':
            self.order_data()
            # print(self.__organised_data_structure,'\n', name)
        
    def _get_name(self):return self.__name if self.__name is not None else ''

    def order_data(self):
        if self.__name is not None and self.__name.lower() != 'generator':
            for i in self.__items:
                dict_temp = i.to_dict();
                size = dict_temp['size'];
                
                s =''
                if 'Voltage' in size:
                    # figure out where it falls...
                    voltage = round(size['Voltage']['value'])
                    if abs(voltage-12) <= 3 or voltage <=12:
                        s = STD_VOLTAGE_12
                    elif abs(voltage-24) <= 3 or (voltage <=24 and voltage>=16):
                        s = STD_VOLTAGE_24
                    elif abs(voltage-48) <= 8 or (voltage <=48 and voltage >=28):
                        s = STD_VOLTAGE_48

                elif 'BatVoltage' in size:
                    voltage = round(size['BatVoltage']['value'])
                    if abs(voltage-12) <= 3 or voltage <=12:
                        s = STD_VOLTAGE_12
                    elif abs(voltage-24) <= 3 or (voltage <=24 and voltage>=16):
                        s = STD_VOLTAGE_24
                    elif abs(voltage-48) <= 8 or (voltage <=48 and voltage >=28):
                        s = STD_VOLTAGE_48

                if s in self.__organised_data_structure:
                    self.__organised_data_structure[s].append(i)
                else:
                    self.__organised_data_structure[s] = []
                    self.__organised_data_structure[s].append(i)

    def set_current_size(self, size):
        if size in STD_VOLTAGE_LIST:
            if size in self.__organised_data_structure:
                self.__current_list = self.__organised_data_structure[size]
                if self.__next_package is not None:
                    return self.__next_package.set_current_size(size)
            else:
                sze = int(size.split('-')[1])
                bs = size.split('-')[0]
                if bs+'-'+str(sze*2) in self.__organised_data_structure:
                    self.__current_list = self.__organised_data_structure[bs+'-'+str(sze*2)]
                    return self.__next_package.set_current_size(size)
                else:
                    try:
                        self.__current_list = self.__organised_data_structure[STD_VOLTAGE_48]
                        return self.__next_package.set_current_size(size)
                    except Exception as e:
                        print("Error setting current size {}".format(size),e)
            return 

    def ordered_packing(self, package):
        try:
            item = choice(self.__items)
            # print('Package Flag ',item.to_dict()['package-flag'])
            while item.to_dict()['package-flag']: 
                item = choice(self.__items)
            package.add_item(item) # append my current element
        except IndexError as e:
            print('Error Adding package')

        if not self.is_last(): # if you not the last subpackagegroup, call the next subpackage.
            res = self.__next_package.ordered_packing(package) 
            return res
        else: 
            return False
                
    def next_package(self):
        return self.__next_package
    
    def add_count_to_table(self, table:dict):
        table[self.__name] = self.__max_items
        if self.__next_package is not None:
            return self.__next_package.add_count_to_table(table)
        else:
            return
        
    def next(self):
        if self.__current_count <= (len(self.__items)-2):
            self.__current_count += 1 
            self.__current_item = self.__items[self.__current_count]
            return self.__current_item
       
>>>>>>> dev-web-server
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
<<<<<<< HEAD
=======
    def is_current_end(self):return self.__current_list_index == (len(self.__current_list)-1)
>>>>>>> dev-web-server
    def is_last(self):return self.__next_package == None
    def is_first(self): return self.__index == 0

    def reset(self):
        self.__current_count = 0
        if self.__next_package is not None:
            self.__next_package.reset()
        return

<<<<<<< HEAD
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

        
=======
    def create_package(self, package):
        if self.__name.lower() == 'generator':
            self.pack(package)
        else:
            self.ordered_packing(package)
    
    def pack(self, package)->bool:
        # print("name: {} currentCount: {}, ".format(self.__name, self.__current_count), end="")
        item = choice(self.__items)
        # print('Package Flag ',item.to_dict()['package-flag'])
        while item.to_dict()['package-flag']: 
            item = choice(self.__items)
        package.add_item(item) # append my current element
        if not self.is_last(): # if you not the last subpackagegroup, call the next subpackage.
            res = self.__next_package.pack(package) # next subpackage group, give us your item
            return res # tell everyone else not to change..
        else:  
            return False

     
>>>>>>> dev-web-server
class PackageHandler:
    def __init__(self, _sub_packages:dict=None):
        self.__sub_packages_list = list()
        self.__packages = list()
        self.__package_count = 0
<<<<<<< HEAD
        if _sub_packages is not None:
            self.__populate_sub_p(_sub_packages)
=======
        self.__subs_table = {}
        if _sub_packages is not None:
            self.__populate_sub_p(_sub_packages)
            self.get_subs_table()

    def possible_package_count(self):
        max_count = 1
        for i in self.__subs_table.values():
            max_count *= i
        return max_count
>>>>>>> dev-web-server

    def get_summary(self):
        d = dict()
        counter = 0
<<<<<<< HEAD
        for p in self.__packages:
=======
        t_list = sample(self.__packages, len(self.__packages))
        for p in t_list:
>>>>>>> dev-web-server
            d['packag '+str(counter)]=p.get_summary()
            counter+=1
        return d

<<<<<<< HEAD
=======
    def search_package_by_id(self, uid:str):
        pass

    def get_subs_table(self):
        
        self.__sub_packages_list[0].add_count_to_table(self.__subs_table)
        return self.__subs_table

>>>>>>> dev-web-server
    def __append_sub(self, sub_p:Subpackage):
        if sub_p not in self.__sub_packages_list:
            self.__sub_packages_list[len(self.__sub_packages_list)-1]._append_next(sub_p)
            self.__sub_packages_list.append(sub_p)

    def __populate_sub_p(self, subs:dict):
<<<<<<< HEAD
        for i in subs.values():
            temp = Subpackage(i)
=======
        keys = subs.keys()
        for i in keys:
            temp = Subpackage(subs[i])
            temp._set_name(i)
>>>>>>> dev-web-server
            self.__sub_packages_list.append(temp)
        self.__link_list()
    
    def __link_list(self):
        if len(self.__sub_packages_list)>=2:
            for i in range(len(self.__sub_packages_list)):
                try:
                    self.__sub_packages_list[i]._append_next(self.__sub_packages_list[i+1])
                except IndexError:
                    return
        
<<<<<<< HEAD
    def generate_package(self, n):
        first_sub = self.__sub_packages_list[0]
        for i in range(n):
            temp = Package()
            first_sub.pack(temp)
            self.__package_count +=1
            self.__packages.append(temp)
        return self.__packages
           
=======
    def generate_package(self, n=0):        
        first_sub = self.__sub_packages_list[0]
        try:
            first_sub.set_current_size(STD_VOLTAGE_48)
        except Exception as e:
            pass
        self.__packages = []
        if n > 0:
            for i in range(n):
                temp = Package()
                first_sub.create_package(temp)
                self.__package_count +=1
                self.__packages.append(temp)
            return self.__packages
        else:
            for i in range(self.possible_package_count() if self.possible_package_count() <100 else 100):
                temp = Package()
                first_sub.create_package(temp)
                self.__package_count +=1
                self.__packages.append(temp)
            return self.__packages
>>>>>>> dev-web-server
