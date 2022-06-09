

class Parser:
    def __init__(self) -> None:
        self.__data_frame = None
        self.__registered_parsers = {}
        self.__items_collection = {}
        self.__indexing_table = {}
        self.__key_map = {}
        self.default_config()

    def default_config(self):
        self.__items_collection = { # initialise items collection
            'solar':[], 
            'inverter':[], 
            'battery':[], 
            'controller':[],
            'rack':[],
            'labour':[], 
            'cable':[], 
            'generator':[],
            'default':[]
        }

        l = ['ItemName', 'PackageGroup', 'Brand', 'TypeGroup', 'SizeGroup',
                'ItemPrice', 'Extras']
        
        for i in range(len(l)): # initialise index table
            self.__indexing_table[l[i]] = i

        # initialise key map
        self.__key_map = {
            'name':l[0],
            'package-group':l[1],
            'brand':l[2],
            'type-group':l[3],
            'size':l[4],
            'price':l[5],
            'extras':l[6]
        }



    def parse_data_frame(self, df)->dict:
        self.__data_frame = df
        # print(self.__data_frame)
        # 1) get items from the data frame ...
        # 2) parse extras from the item
        # 3) check size property of the items if > 1 call parse_size_many(item) else call parse_size_single(item)
        # 4) parse the rest of the items in the extras first ... 
        # 5) parse the rest of the items 
        # 6) append element to the list ...
        try:
            length = len(self.__data_frame.index)
            
            for i in range(length):
                j_data = {}
                item = self.__data_frame.loc[i]
                
                e_table = self.parse_extras(item)
                
                             
                if len(e_table)>0 and self.__key_map['size'] in e_table.keys(): # parse the size...
                    s = e_table[self.__key_map['size']]
                    j_data['size'] = self.parse_size(item, s)
                else: 
                    j_data['size'] = self.parse_size(item, 1)
                

                for p in self.__key_map.keys():
                    
                    # check if out current index is not size of extras since these are parsed already..
                    if self.__key_map[p] in self.__indexing_table.keys() and p != 'size' and p != 'extras': 
                        
                        if self.__key_map[p] in e_table.keys() and e_table[self.__key_map[p]] >1: # we have an extra with a value bigger than 1
                            j_data[p] = self.parse_item_list(item[self.__indexing_table[self.__key_map[p]]], True)
                            
                        elif p == 'price':
                            j_data[p] = float(item[self.__indexing_table[self.__key_map[p]]])
                        else:
                            j_data[p] = item[self.__indexing_table[self.__key_map[p]]]
                
                self.add_to_list(j_data)

        except Exception as e:
            print("Error parsing an object", e)
        finally:
            return self.__items_collection         



    def parse_size(self, df_item, n:int=1):
        
        size = df_item[self.__indexing_table[self.__key_map['size']]]
        
        s_object = {}
        if n > 1:
            s_list = self.parse_item_list(size)     
            for _s in s_list:
                try:
                    _r = _s.split(':')
                    value = _r[1]
                    _r2 = _r[0].split('-')
                    name = _r2[0]
                    unit = _r2[1]
                    if name.isalnum:
                        s_object[name.strip('[0-9][0-9]?')] = {'value':float(value), 'unit':unit, 'qty':0}
                    else:
                        s_object[name]={'value':float(value), 'unit':unit}
                except Exception as e:
                    print(e)
        else:
            try:
                _r = size.split(':')
                value = _r[1]
                _r2 = _r[0].split('-')
                name = _r2[0]
                unit = _r2[1]
                s_object[name]={'value':float(value), 'unit':unit};
            except Exception as e:
                    pass

        return s_object

    def register_parser(self, key:str, callback):
        self.__registered_parsers[key] = callback

    def parse_item_list(self, item:str, to_json:bool=False):
        if type(item) is str:
            i_list = item.split(',')
            if to_json:
                json_res = {}
                counter = 0
                for i in i_list:
                    json_res[str(counter)] = i
                    counter += 1
                return json_res
            else:
                return i_list


    def parse_extras(self, df_item):
        extras_table = {}
        
        try:
            extras = df_item[self.__indexing_table[self.__key_map['extras']]]
            e_list = self.parse_item_list(extras)
            
            if e_list is not None:
                for i in e_list:
                    res = i.split(':')
                    
                    extras_table[res[0]] = int(res[1])
                    # print(df_item[self.__indexing_table[self.__key_map['size']]])
                
        except Exception as e:
            print('There was an error', e)
        finally:
            return extras_table


    def add_to_list(self, j_item:dict):
        if j_item['name'].lower().lstrip() in self.__items_collection:
            self.__items_collection[j_item['name'].lower().lstrip()].append(j_item)
        else:
            self.__items_collection['default'].append(j_item)
