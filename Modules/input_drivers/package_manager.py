import Modules.Utils.CONSTANTS as CONSTANTS
import Modules.input_drivers.item as item
import Modules.input_drivers.db_manager as db_manager
import hashlib
import random

class Package:
    def __init__(self, _obj:dict=None) -> None:
        self._obj = _obj
        self.__total_price = 0
        self.__items_list = []
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
    
    def _gen_total(self):
        s = self.__items_list[0].get_price()
        for item in self.__items_list:
            if item.get_name() == 'solar':
                s+= item.get_price()*self.__solar_qty
            else:
                s += item.get_price()

        return (s - self.__items_list[0].get_price())
    
    def get_summary(self):
        counter = 0
        d = dict()
        for i in self.__items_list:
            d['item '+str(counter)] = i.to_dict()
            counter += 1
        d['total-price'] = self.__total_price
        d['_uid'] = self.__uid
        d['max-power'] = self.__max_power
        d['solar-qty'] = self.__solar_qty
        return d
    
        

class Subpackage:
    def __init__(self, items:list=[]): # items in this list are already parsed into local Item objects.
        self.__items = items
        self.__current_count = 0
        self.__current_item = self.__items[0]
        self.__next_package = None
        self.__index = 0
        self.__change_flag = False
        self.__max_items = len(self.__items)
        self.__name = None
        self.__organised_data_structure = {}  # this structure sorts the data according to the 
        self.__current_list = []
        self.__current_list_index = 0
        
        # print("Items in subpackage:\n",items)
    
    def _get_items(self):return self.__items
    def _set_items(self, items_list):self.__items = items_list
    def _get_current_count(self):return self.__current_count
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
                        s = CONSTANTS.STD_VOLTAGE_12
                    elif abs(voltage-24) <= 3 or (voltage <=24 and voltage>=16):
                        s = CONSTANTS.STD_VOLTAGE_24
                    elif abs(voltage-48) <= 8 or (voltage <=48 and voltage >=28):
                        s = CONSTANTS.STD_VOLTAGE_48

                elif 'BatVoltage' in size:
                    voltage = round(size['BatVoltage']['value'])
                    if abs(voltage-12) <= 3 or voltage <=12:
                        s = CONSTANTS.STD_VOLTAGE_12
                    elif abs(voltage-24) <= 3 or (voltage <=24 and voltage>=16):
                        s = CONSTANTS.STD_VOLTAGE_24
                    elif abs(voltage-48) <= 8 or (voltage <=48 and voltage >=28):
                        s = CONSTANTS.STD_VOLTAGE_48

                if s in self.__organised_data_structure:
                    self.__organised_data_structure[s].append(i)
                else:
                    self.__organised_data_structure[s] = []
                    self.__organised_data_structure[s].append(i)

    def set_current_size(self, size):
        if size in CONSTANTS.STD_VOLTAGE_LIST:
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
                        self.__current_list = self.__organised_data_structure[CONSTANTS.STD_VOLTAGE_48]
                        return self.__next_package.set_current_size(size)
                    except Exception as e:
                        print("Error setting current size {}".format(size),e)
            return 

    def ordered_packing(self, package):
        try:
            item = random.choice(self.__items)
            # print('Package Flag ',item.to_dict()['package-flag'])
            while item.to_dict()['package-flag']: 
                item = random.choice(self.__items)
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
    def is_current_end(self):return self.__current_list_index == (len(self.__current_list)-1)
    def is_last(self):return self.__next_package == None
    def is_first(self): return self.__index == 0

    def reset(self):
        self.__current_count = 0
        if self.__next_package is not None:
            self.__next_package.reset()
        return

    def create_package(self, package):
        if self.__name.lower() == 'generator':
            self.pack(package)
        else:
            self.ordered_packing(package)
    
    def pack(self, package)->bool:
        # print("name: {} currentCount: {}, ".format(self.__name, self.__current_count), end="")
        item = random.choice(self.__items)
        # print('Package Flag ',item.to_dict()['package-flag'])
        while item.to_dict()['package-flag']: 
            item = random.choice(self.__items)
        package.add_item(item) # append my current element
        if not self.is_last(): # if you not the last subpackagegroup, call the next subpackage.
            res = self.__next_package.pack(package) # next subpackage group, give us your item
            return res # tell everyone else not to change..
        else:  
            return False

     
class PackageHandler:
    def __init__(self, _sub_packages:dict=None):
        self.__sub_packages_list = list()
        self.__packages = list()
        self.__package_count = 0
        self.__subs_table = {}
        if _sub_packages is not None:
            self.__populate_sub_p(_sub_packages)
            self.get_subs_table()

    def get_sub_package_list(self):return self.__sub_packages_list

    def possible_package_count(self):
        max_count = 1
        for i in self.__subs_table.values():
            max_count *= i
        return max_count

    def get_summary(self):
        d = dict()
        counter = 0
        t_list = random.sample(self.__packages, len(self.__packages))
        for p in t_list:
            d['packag '+str(counter)]=p.get_summary()
            counter+=1
        return d

    def search_package_by_id(self, uid:str):
        pass

    def get_subs_table(self):
        if len(self.__sub_packages_list) > 0:
            self.__sub_packages_list[0].add_count_to_table(self.__subs_table)
            return self.__subs_table

    def __append_sub(self, sub_p:Subpackage):
        if sub_p not in self.__sub_packages_list:
            self.__sub_packages_list[len(self.__sub_packages_list)-1]._append_next(sub_p)
            self.__sub_packages_list.append(sub_p)

    def __populate_sub_p(self, subs:dict):
        keys = subs.keys()
        for i in keys:
            temp = Subpackage(subs[i])
            temp._set_name(i)
            self.__sub_packages_list.append(temp)
        self.__link_list()
    
    def __link_list(self):
        if len(self.__sub_packages_list)>=2:
            for i in range(len(self.__sub_packages_list)):
                try:
                    self.__sub_packages_list[i]._append_next(self.__sub_packages_list[i+1])
                except IndexError:
                    return
        
    def generate_package(self, n=0):        
        first_sub = self.__sub_packages_list[0]
        try:
            first_sub.set_current_size(CONSTANTS.STD_VOLTAGE_48)
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