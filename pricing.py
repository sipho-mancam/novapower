from cerberus import Validator

installers_option ={
    'name':'Installer',
    'price':0
}

delivery_option = {
    'name':'Delivery',
    'price':0
}


class PriceModel:
    def __init__(self, uid:str):
        self.__bucket_list = []
        self.__client_uid = uid
        self.__item_count = 0
        self.__tot = 0
        self.__tax = 0
        self.__sub_tot = 0
        self.validoator = None

    def add_item(self, item:dict):
        if self.validate_item(item):
            self.__bucket_list.append(item)
            self.__item_count += 1
            self.update_price(item,'price')

            if 'options' in item and len(item['options'])>0:
                if self.validate_options_many(item['options']):
                    self.update_price(item)
                    self.update_item_name(item)
                else:
                    print('[!]\tOptions do not meet the schema requirements:\n\tError{}'.format(self.validator.errors))

        else:
            print('[!] Item missing attributes {}'.format(self.validator.errors))
    
    def search_item(self, _uid:str): # quick linear search ...
        uid = _uid
        for item in self.__bucket_list:
            if item['_uid'] == uid:
                return item
        return None
    
    def update_item_name(self, item:dict):
        opt = item['options']
        for key in item['options']:
            item['name'] += ' + '+opt[key]['name']
        

    def update_price(self, item:dict, key:str='options'):
        if key in item:
            if key =='price':
                self.__tot += item[key]
            else: 
                for opt in item[key]:
                    option = item[key][opt]
                    if 'price' in option:
                        p = option['price']
                        self.__tot += p
        self.compute_prices()
        

    def update_item_options(self, _uid:str, options:dict, append:bool=False): 
        item = self.search_item(_uid)
        if self.validate_options(options):
            if item is not None:
                if append:
                    item['options'] = options
                else:
                    if 'options' not in item: item['options'] = {}
                    for key in options.keys():
                        item['options'][key]= options[key]

                self.update_item_name(item)
                self.update_price(item)
            else:
                print('[!] item with UID: {} doesn\'t exist'.format(_uid))
        
    def compute_prices(self):
        self.__tax = round(0.15*self.__tot, 2)
        self.__sub_tot = self.__tot - self.__tax
        

    def get_pricing_summary(self)->dict:
        s = {}
        counter = 0
        for item in self.__bucket_list:
            s['item '+str(counter)] = item
            counter +=1

        s['sub-total'] = self.__sub_tot
        s['total'] = self.__tot
        s['vat'] = self.__tax
        return s

    def get_totals(self):
        s = {}
        s['sub-total'] = self.__sub_tot
        s['total'] = self.__tot
        s['vat'] = self.__tax
        return s
    

    def validate_item(self, item:dict)->bool:
        schema = {
            'name':{
                'type': 'string',
            },
            'price':{
                'type':'float'
            },
            '_uid':{
                'type':'string'
            }
        }
        validator = Validator(schema, allow_unknown=True, require_all=True)
        self.validator = validator
        return validator.validate(item)

    def validate_options_many(self, options:dict)->bool:
        for key in options.keys():
            if self.validate_options(options[key]):continue
            else: return False
        return True

    def validate_options(self, options:dict)->bool:
        schema = {
            'name':{
                'type': 'string',
            },
            'price':{
                'type':'float'
            }
        }
        validator = Validator(schema, allow_unknown=True, require_all=True)
        self.validator = validator
        return validator.validate(options)    


def process_cart_pricing(cart_list:list, session_token:str, processed_list:list=None)->dict:
    pricing = PriceModel(session_token)
    for cart_object in cart_list:
        pack = cart_object['package']
        r_pack = pack['obj']
        r_pack['qty'] = cart_object['qty']
        r_pack['price'] = r_pack['qty'] * r_pack['total-price']
        pricing.add_item(r_pack)
        if processed_list is not None: processed_list.append(r_pack)

    return pricing.get_totals()

def update_processed_list(session_token:str, processed_list:list):
    pricing = PriceModel(session_token)
    for r_pack in processed_list:
        pricing.add_item(r_pack)
    return pricing

def update_items_in_p_list(update_list:list, price_model:PriceModel):
    for item in update_list:
        price_model.update_item_options(item['_uid'], item['options'], True)
        
    return price_model
