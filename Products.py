from init import setup_input
from packages import Subpackage

class Stage:
    def __init__(self, sub_package:Subpackage, filters:dict=None) -> None:
        self.__sub_package_objects = []
        if sub_package is not None and type(sub_package) is list: self.__sub_package_objects = sub_package
        elif sub_package is not None and type(sub_package) is Subpackage: self.__sub_package_objects.append(sub_package)
        self.__temp_list = []
        self.__committed = []
        self.filters = filters
        self.meta_data = {}
        self.summary = {}
        self.max_count = 15
        self.last_index = 0
        brands = self.get_brands()
        brands['type'] = 'list|object'
        self.__default_filters = {
            # 'size':{
            #     'Size':{'type': 'int|float'},
            #     'voltage':{'type':'int|float'}
            # },
            'brand':brands,
            'max-price':{'type':'float'}
        }
        self.__rollback_filters = {'scope':'*', 'filter':{
            'p':{
                'name':'package-flag',
                'value':False
            }
        }}

    def reset(self):
        self.filters = self.__rollback_filters
    
    def get_filters(self):return self.filters

    def get_default_filters(self):return self.__default_filters

    def set_last_index(self, n:int):self.last_index = n

    def get_brands(self):
        res = {}
        for sub in self.__sub_package_objects:
            res[sub._get_name()] = self.__get_sub_brands(sub);
        return res

    def __get_sub_brands(self, sub_pacakage):
        res = {'name': sub_pacakage._get_name(), 'brand':set()}
        items_list = sub_pacakage._get_items()
        for i in items_list:
            i = i.to_dict()
            if not i['package-flag'] :res['brand'].add(i['brand'])
        l = []
        for i in res['brand']:
            l.append(i)
        res['brand'] = l
        return res

    def add_to_stage(self, sub_pacakage:Subpackage)->None:
        if sub_pacakage is not None:
            if type(sub_pacakage) is Subpackage:
                self.__sub_package_objects.append(sub_pacakage)
            elif type(sub_pacakage) is list:
                for i in sub_pacakage:
                    self.__sub_package_objects.append(i)
        
    def _set_max_count(self, max):
        self.max_count = max

    def add_filter(self, _filter:dict):
        self.filters = _filter
    
    def __determine_scope(self):
        # get the scope of the filter....
        if type(self.filters['scope']) is str: # this means that we are looking for a single category or we are looking for all
            if self.filters['scope'] == '*': # give me all of the items that are available ...
                self.__temp_list = {}
                for l in self.__sub_package_objects:
                    self.__temp_list[l._get_name()] = l._get_items()
            else:  # we are looking for a single category of items...
                for sub in self.__sub_package_objects:
                    if sub._get_name() == self.filters['scope']:
                        self.__temp_list = sub._get_items()
                        # apply the filter to the items...
        elif type(self.filters['scope']) is list:
            self.__temp_list = {}
            for l in self.__sub_package_objects:
                # get the object in the list...
                if '*' not in self.filters['scope']:
                    if l._get_name() in self.filters['scope']:
                        self.__temp_list[l._get_name()] = l._get_items()
                else:
                    self.__temp_list = {}
                    for l in self.__sub_package_objects:
                        self.__temp_list[l._get_name()] = l._get_items()

    def __apply_filter_to_list(self, filter:dict, l:list):
        count = 0
        limit = len(filter)
        for item in l:
            for f_key in filter.keys():
                filt = filter[f_key]

                if 'scope' in filt and filt['scope'] != '*' and item.to_dict()['name'].lower() not in filt['scope']: # this item is not affected by this filter.
                    count += 1
                    continue;
                
                d = item.to_dict()
                if type(filter[f_key]['value']) is str: # string comparison   
                    t = d[filter[f_key]['name']]
                    if type(t) is str: 
                        t = t.lower()
                    elif type(t) is dict:
                        keys = t.keys()
                        for k in keys:
                            t = t[k]
                            break;
                        t = t.lower()

                    if filter[f_key]['name'] in d and filter[f_key]['value'].lower() == t:
                        count += 1

                elif type(filter[f_key]['value']) is float or type(filter[f_key]['value']) is int: # we assume that if it is not a string it's a number....
                    if filter[f_key]['name'] in d and filter[f_key]['value'] >= d[filter[f_key]['name']]:
                        count += 1

                elif type(filter[f_key]['value']) is dict: # process the size parameter here...
                    if filter[f_key]['name'] in d:
                        for k in filter[f_key]['value'].keys():
                            if k in d[filter[f_key]['name']] and d[filter[f_key]['name']][k]['value'] <= filter[f_key]['value'][k]:
                                count += 1
                            elif k not in d[filter[f_key]['name']]: # give it a point if it is not concerned with this parameter
                                count +=1

                elif type(filter[f_key]['value']) is bool:
                      if filter[f_key]['name'] in d and filter[f_key]['value'] == d[filter[f_key]['name']]:
                        count +=1

                elif type(filter[f_key]['value']) is list: # we have more than one option we are looking at. (brands filtering)
                    if filter[f_key]['name'] in d and d[filter[f_key]['name']] in filter[f_key]['value']:
                        count +=1

            if count == limit:
                self.__committed.append(item) # add to __committed objects if it passed all the filters..
            count = 0 # reset on every iteration ...
    
    def apply_filter(self):
        self.__determine_scope()
        if len(self.__temp_list)>0:
            if type(self.__temp_list) is dict: # this means we are dealing with multiple categories
               # get the number of filters to apply...
               for key in self.__temp_list.keys():
                    self.__apply_filter_to_list(self.filters['filter'], self.__temp_list[key])

            elif type(self.__temp_list) is list: # we are dealing with a single category...
                self.__apply_filter_to_list(self.filters['filter'], self.__temp_list)
        
    def __set_meta_data(self):
        self.summary['metadata'] = {}
        self.summary['metadata']['count'] = len(self.__committed)
        self.summary['metadata']['filters'] = self.filters['filter']
        self.summary['metadata']['scope'] = self.filters['scope']
        self.summary['metadata']['max-count'] = self.max_count
        self.summary['data'] = {}
        count = 0
        for item in self.__committed:
            # if count < self.max_count:
            self.summary['data']['item '+str(count)] = item.to_dict()
            count += 1

    def get_products_list(self):
        res = []
        for k in self.__sub_package_objects:
            res.append(k._get_name())
        return res
    
    def get_item_filters(self, name:str):
        res = []
        for k in self.__sub_package_objects:
            if k._get_name().lower() == name.lower():
                item = k._get_items()[0].to_dict()
                for k in item:
                    res.append(k)
        return res

    def __validate_before_processing(self):
        if self.filters is not None and len(self.__sub_package_objects) > 0:
            return True
        else: return False    

    def get_summary(self):
        if self.__validate_before_processing():
            self.apply_filter()
            self.__set_meta_data()
            self.__committed = []
            self.reset()
            return self.summary
        else:
            print("Please add a filter") 
            return None


def init_stage():
    data_path = './DatabaseIndividualPricingInputFormat v2.xlsx'
    stage = Stage(setup_input(data_path, 'Sheet 1').get_sub_package_list())
    stage.add_filter({'scope':'*', 'filter':{
        'p':{
            'name':'package-flag',
            'value':False
        }
    }})
    return stage

# s = init_stage()


                
                




