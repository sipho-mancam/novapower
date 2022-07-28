from Modules.Utils.init import setup_input
import Modules.input_drivers.package_manager as pm
import cerberus
import pprint
class Stage:
    def __init__(self, sub_package:pm.Subpackage|dict, filters:dict=None) -> None:
        self.__sub_package_objects = []
        if sub_package is not None and type(sub_package) is list: self.__sub_package_objects = sub_package
        elif sub_package is not None and type(sub_package) is pm.Subpackage: self.__sub_package_objects.append(sub_package)
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
            'size':{
                'Size':{'type': 'int|float'},
                'voltage':{'type':'int|float'}
            },
            'brand':brands,
            'price':{'type':'float'}
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
            if not i['package-flag'] :res['brand'].add(i['brand'])

        l = list(res['brand'])
        res['brand'] = l
        return res

    def add_to_stage(self, sub_pacakage:pm.Subpackage)->None:
        if sub_pacakage is not None:
            if type(sub_pacakage) is pm.Subpackage:
                self.__sub_package_objects.append(sub_pacakage)
            elif type(sub_pacakage) is list:
                self.__sub_package_objects.extend(sub_pacakage)
            

    def _set_max_count(self, max):
        self.max_count = max

    def add_filter(self, _filter:dict):
        self.filters = _filter
    
    def __determine_scope(self):
        """
        Args: None

        Reason:
            This function gives us the scope of search for items to filter, 
            it iterates over subpackages which are containers for individual items to determine how many, if any, we should search over.
        Return: None
        """
        # get the scope of the filter....
        if type(self.filters['scope']) is str: # this means that we are looking for a single category or we are looking for all
            if self.filters['scope'] == '*': # give me all of the items that are available ...
                self.__temp_list = {}
                for l in self.__sub_package_objects:
                    self.__temp_list[l._get_name()] = l._get_items()
            else:  # we are looking for a single category of items...
                for sub in self.__sub_package_objects:
                    if sub._get_name().lower() == self.filters['scope'].lower():
                        self.__temp_list = sub._get_items()
                       
        elif type(self.filters['scope']) is list: # this means we are looking for a selected few
            self.__temp_list = {}
            if '*' not in self.filters['scope']: 
                for l in self.__sub_package_objects:
                    # get the object in the list...
                    if l._get_name() in self.filters['scope']:
                        self.__temp_list[l._get_name()] = l._get_items() # give me them item space of all the objects that need to be filtered..
            else: # dump everything in there. .. this is for portability problems, in cases where we can't send a string due to some design flaw.
                self.__temp_list = {}
                for l in self.__sub_package_objects:
                    self.__temp_list[l._get_name()] = l._get_items()
    def valide_object(self, schema:dict=None, item:dict=None, o_type:str='item',**kwargs):
        """
        Args:
            schema:dict-> The schema to apply if you don't want the default ones to be applied.
            item:dict -> dictionary item to apply the schema to and validate
            o_type: for selecting between different default schemas. The type of object [filter or item or other]
        Reason:
            To avoid crashing if the objects do not have the default parameters we are normally looking for
        Return:
            bool -> Indicating whether or not the "item" meets the criteria.
        """
        item_schema = {
            'name':{
                'type': 'string',
                'required':True
                }
            }
        filter_schema = {
            'name':{
                'type':'string',
                'required':True
            },
            'value':{
                'type':['string', 'list', 'dict', 'boolean', 'number'],
                'required':True
            },
            'scope':{
                'type':['string', 'dict']
            }
        }

        schemas_table = {
            'item':item_schema,
            'filter':filter_schema
        }
        if schema is not None:
            schemas_table[o_type] = schema
        val = cerberus.Validator()
        val.schema = schemas_table[o_type]
        return val.validate(item)

    def __apply_filter_to_list(self, filter:dict, l:list):
        """
        Args:
            filter:dict -> filter to be applied to the list.
            l:list -> list of items where the filter will be applied.
        Reason:
            The method is made for internal calls by the object and not outside the scope of the class for a few reasons.
            1) It depends on some properties and methods of the class that need the class to be initialised before it can work.
                (is that a design flaw ?)
            2) It seperated from the "apply_filter() method because we want to filter different list seperately, allows for versatility and organisation.
        Return: None
        """
       
        count = 0
        limit = len(filter)
        for item in l:
            for f_key in filter:
                filt = filter[f_key] # grab a specific filter.

                if 'scope' in filt and filt['scope'] != '*' and item['name'].lower() not in filt['scope']: # this item is not affected by this filter.
                    count += 1
                    continue;
                
                filter_type = type(filter[f_key]['value'])
                filter_name = filter[f_key]['name']
                filter_value = filter[f_key]['value']
                d = item

                if filter_type is str: 
                    t = d[filter_name]
                    if type(t) is str: 
                        t = t.lower()
                    elif type(t) is dict:
                        keys = t.keys()
                        for k in keys:
                            t = t[k]
                            break;
                        t = t.lower()

                    if filter_name in d and filter_value.lower() == t:
                        count += 1
                
                elif filter_type is float or filter_type is int: # we assume that if it is not a string it's a number....
                    if filter_name in d and filter_value >= d[filter_name]:
                        count += 1

                elif filter_type is dict: # process the size parameter here...
                    if filter_name in d: # almost all the objects will have the size parameter ....
                        temp_count = 0
                        """
                            Allow the object to accumulate points over hits for all the criteria they meet.
                        """
                        for k in filter_value:
                            if k in d[filter_name] and d[filter_name][k]['value'] <= filter_value[k]:
                                temp_count += 1
                            elif k not in d[filter_name]: # give it a point if it is not concerned with this parameter
                                temp_count +=1

                        if temp_count == len(filter_value): count +=1 # only get a point when you meet all the sizing criteria.

                elif type(filter_value) is bool:
                    if filter_name in d and filter_value == d[filter_name]:
                        count +=1

                elif type(filter_value) is list: # we have more than one option we are looking at. (brands filtering)
                    if filter_name in d and d[filter_name] in filter_value:
                        count +=1
                

            if count >= limit:
                self.__committed.append(item) # add to __committed objects if it passed all the filters..
            count = 0 # reset on every iteration ...
    
    def apply_filter(self):
        """
        Args:None
        Reason: 
            this method orchastrates the whole filtering process, from determing scope to doing the actual filtering.
        Return: None

        Remark: 
            All filtered items will be stored in the commited list. and only the committed list will be looked at for results.
        """
        self.__determine_scope()
        if len(self.__temp_list)>0: # any of this is necessary is we have some items to apply filters to.
            if type(self.__temp_list) is dict: # this means we are dealing with multiple categories
               for items_class in self.__temp_list:
                    self.__apply_filter_to_list(self.filters['filter'], self.__temp_list[items_class])

            elif type(self.__temp_list) is list: # we are dealing with a single category...
                self.__apply_filter_to_list(self.filters['filter'], self.__temp_list)
        
    def __set_meta_data(self):
        self.summary['metadata'] = {}
        self.summary['metadata']['actual-count'] = len(self.__committed)
        self.summary['metadata']['filters'] = self.filters['filter']
        self.summary['metadata']['scope'] = self.filters['scope']
        self.summary['metadata']['max-count-possible'] = self.max_count
        self.summary['data'] = {}
        count = 0
        for item in self.__committed:
            self.summary['data']['item '+str(count)] = item
            count += 1

    def get_products_list(self):
        res = [obj._get_name() for obj in self.__sub_package_objects]
        return res
    
    def get_item_filters(self, name:str):
        res = []
        for k in self.__sub_package_objects:
            if k._get_name().lower() == name.lower():
                item = k._get_items()[0]
                for k in item: # keys in items we can use to filter.
                    res.append({'name':item['name'], 'filter-name':k, 'value-type':str(type(item[k]))})
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
            return None



def init_stage():
    data_path = "Data/DatabaseIndividualPricingInputFormat v2.xlsx"
    stage = Stage(setup_input(data_path, 'Sheet 1').get_sub_package_list())
    stage.add_filter({'scope':'*', 'filter':{
        'p':{
            'name':'package-flag',
            'value':False
        }
    }})
    return stage

# s = init_stage()


                
                




