"""
LP builder

"""
import hashlib
import json
import pprint
import random
import re
import numpy as np
import matplotlib.pyplot as plt
import pathlib
import os 


CONFIG_DIR_STR = __file__+"/../../configs/"

CONFIG_DIR = pathlib.Path(CONFIG_DIR_STR).resolve()


class LPBuilder:
    def __init__(self, item_s:dict|list=None) -> None:
        self.__appliance_list = []
        self.__loading_profile = np.zeros((1,24), dtype=np.float64)[0]

        if type(item_s) is list: self.__appliance_list.extend(item_s)
        elif type(item_s) is dict: self.__appliance_list.append(item_s)
        self.__compute_profile()

    def add_appliance(self, appliance:dict|list)->None:
        if type(appliance) is list:
            self.__appliance_list.extend(appliance)
        elif type(appliance) is dict:
            self.__appliance_list.append(appliance)
        self.__compute_profile()

    def calculate_hyp_profile(self, app_list:list)->list:
        rb = self.__loading_profile
        rb2 = self.__appliance_list
        self.__appliance_list = app_list
        self.__compute_profile()
        res = self.__loading_profile
        self.__loading_profile = rb
        self.__appliance_list = rb2
        return list(res)

    def __compute_profile(self, lp=None):
        if lp is None:self.__loading_profile = np.zeros((1,24), dtype=np.float64)[0]
        for i in self.__appliance_list:
            a = i['usage-profile'][0]*np.array(i['usage-profile'][1:], dtype=np.int32) # convert the appliance usage profile to a numpy array with On of Off states.
            self.__loading_profile+=a # impose it on the total loading profile.... this will create a hypothetical loading profile of a property.

    def get_profile(self):
        self.__compute_profile()
        return list(self.__loading_profile)

    def plot_profile(self):
        fig, ax = plt.subplots()
        x = np.array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24])
        line2, = ax.plot(x, self.__loading_profile)
        plt.show()


    # Utility methods for quick use
    def update_profile(self, lp_profile, item_s)-> np.ndarray:
        # we receive a list from the outside world, and convert it to an np array
        lp_np = np.array(lp_profile)
        rb1, rb2 = self.__appliance_list, self.__loading_profile

        self.__loading_profile = lp_np
        if type(item_s) is dict:
            self.__appliance_list = [item_s]
        elif type(item_s) is list:
            self.__appliance_list = lp_profile
        self.__compute_profile(self.__loading_profile)

        lp_profile = self.__loading_profile
        self.__loading_profile = rb2
        self.__appliance_list = rb1
        return lp_profile


"""
This property builder currently only caters for residential properties..
"""

class PropertyBuilder:
    def __init__(self) -> None:
        self.__available_appliances = {} # read in configuration a dictionary of appliances
        self.__propert_app_list = [] # populated as the property is built
        self.__room_types = [] # read in configuration data
        self.__l_profile_builder = LPBuilder()
        self.__property = dict()
        self.__config = None
        self.__config_files = {'room-types':'/room_types.json', 'app-list':'/app_list.json'}
        self.__room_models = {} # list of usable rooms...
        self.config()
        
    def config(self) -> None:
        c_file_names =  self.__config_files
        for c in c_file_names:
            if c_file_names[c].startswith('/'):
                path = CONFIG_DIR.resolve().__str__()+c_file_names[c];
            else:
                path = CONFIG_DIR.resolve().__str__()+'/'+c_file_names[c];
            
            with open(path) as f:
                    temp = json.loads(f.read())
                    if c =='room-types':
                        self.__room_types = temp
                    elif c == 'app-list':
                        self.__available_appliances = temp
                  
        self.__room_models =  self.__build_room_models(self.__room_types)
    def get_app_list(self):
        l = []
        for app in self.__available_appliances:
            self.__available_appliances[app]['name'] = app
            l.append(self.__available_appliances[app])
        return l
     
    def dict_to_list(self, d):
        li = []
        for i in d:
            temp = d[i]
            temp['name'] = i;
            li.append(temp)
        return li

    def get_available_appliances(self):return [x for x in self.__available_appliances]

    def __build_room_model(self, room_conf:dict):
        room_app_list = room_conf['app-list']
        room_app_qty = room_conf['qty-list']
        room_model={
            'type':room_conf['type'],
            'appliances':[]
        }

        for i in room_app_list:
            if i in self.__available_appliances:
                app = self.__available_appliances[i]
                app['name'] = i
                # find out the quantity of the appliance from the qty list
                qty = room_app_qty[room_app_list.index(i)]
                for i in range(0, qty):
                    ap_cp = app.copy()
                    ap_cp['room'] = room_model['type']
                    ap_cp['id'] = hashlib.sha256(bytes(ap_cp.__str__()+ random.getrandbits(32).__str__() , 'utf-8')).hexdigest()
                    room_model['appliances'].append(ap_cp)
        return room_model

    def __build_room_models(self, rooms_configs:dict)->list:
        output = {}
        for r_m in rooms_configs:
            output[r_m] = self.__build_room_model(rooms_configs[r_m])
        self.__room_models = output.copy()
        return output

    def __house_app_list(self, house:dict)->list:
        total_app_list = []
        rooms = house['rooms']
        for room in rooms:
            if type(rooms[room]) is dict:
                temp = rooms[room]['appliances']
                total_app_list.extend(temp)
            elif type(rooms[room]) is list: # we have more than one room in this class.
                for r in rooms[room]:
                    total_app_list.extend(r['appliances'])
        return total_app_list

    def __compute_house_profile(self, house):
        full_apps_list = self.__house_app_list(house)
        loading_profile = self.__l_profile_builder.calculate_hyp_profile(full_apps_list)
        return loading_profile

    def build_property(self, n_of_bedrooms:int=1, default=True, options={})->dict:
            """
            A property has the following known parameters, every property must have 1) kitchen, 2) lounge and 3) bathroom
            """

            # build the default house and send it to the every.
            house = {
                'n_bedrooms':n_of_bedrooms,
                'rooms':{
                    'lounge':self.__room_models['lounge'].copy(),
                    'bathroom':self.__room_models['bathroom'].copy(),
                    'kitchen':self.__room_models['kitchen'].copy(),
                    'bedroom':[]
                },
                'app-list':[],
                'loading-profile':[]
            }

            for br in range(0, n_of_bedrooms):
                house['rooms']['bedroom'].append(self.__room_models['bedroom'].copy())

            l_profile = self.__compute_house_profile(house)
            house['loading-profile'] = l_profile
            apps_list = self.__house_app_list(house)
            house['app-list'] = apps_list
            return house

    def add_rooms(self, house, room_s:dict, room_type:str)->dict:
        """Add a room to the house and return the house."""
        house['rooms'][room_type] = room_s.copy()
        return house
    
    def house_get(self, house:dict, room_type:str='lounge', key:str='appliance'):
        hfull = house.copy()
        house = house.get('rooms')
        out = house.get(room_type)
        room_type = room_type.lower()
        key = key.lower()

        if key.lower() == 'all': # all appliances
            return [x.get('name') for x in hfull.get('app-list')]
        
        if room_type =='all': # all the rooms ... no appliances
            return list(house.keys())

        if room_type == 'summary':
            keys = list(house.keys())
            res = {}
            for k in keys:
                if type(house.get(k)) is dict:
                    res[k] = {
                        'appliances': [x.get('name') for x in house.get(k).get('appliances')]
                    }
                elif type(house.get(k)) is list:
                    count = 0
                    for br in house.get(k):
                        res['bedroom '+str(count)] = [x.get('name') for x in br.get('appliances')]
                        count +=1
            return res



