import hashlib
import pathlib
import sys
sys.path.append(pathlib.Path(__file__+"/../").resolve().__str__())

from operator import index
import pprint
from re import search
from secrets import choice
from features import Feature
import pathlib
import json
import numpy as np

CONFIG_DIR_STR = __file__+"/../../configs/"

CONFIG_DIR = pathlib.Path(CONFIG_DIR_STR).resolve().__str__()


def list_endpoint_convergence(l, t, epsilon=0):
    """
    Args:
        l->list to search for space,
        t -> target value to search,
        epsilon-> how far from t would be acceptable i.e: no computations are done o epsilon, so don't add percentage perform computations before hand
    1) check max
        if min < t
            if max > t: -> this means that the list has values we don't want to search,
                go to the middle, {let middle = m}
                if m > t: -> this cuts off half the list,
                    if m-1 > t: -> take the lower part of the list from middle l = [0:m]
                else if m < t:
                    if m+1 < t: -> this means, search the up part, all the lower parts are involved{take l = [m:end]}
            run this until we converge to some value that fits the criteria... 
            sanity checks:
                if max > t , this implies that somewhere in the list there's a (value < t), 
                    (provided that the min < t)
        else:
            return, No sum will give t in the list.
    Return Value:
        serach space -> list to search in for possible t summations
    """
    lower_bound = t-epsilon
    upper_bound = t+epsilon
    if len(l)>0 and type(l) is list:
        if l[0]<lower_bound: # make sure that our list has a possibility of a positive result
            if l[-1] > upper_bound: # max is greater than target 
                m = len(l)//2
                if len(l)>3:
                    if (l[m+1] > upper_bound and l[m-1] < upper_bound and l[m]<=t) or (l[m+1] > lower_bound and l[m-1] < lower_bound and l[m]<=t): # if we not at the absolute minimum this won't be true under no circumstance
                        return l[m]
                else:
                   if (l[m]<=t): # if we not at the absolute minimum this won't be true under no circumstance
                        return l[m] 
                # check the middle
                if l[len(l)//2]>upper_bound: # middle is bigger than our target, we need to go low
                    return list_endpoint_convergence(l[0:len(l)//2], t, epsilon)
                elif l[len(l)//2]<lower_bound: # middle is smaller than our target, we need to go high
                    return list_endpoint_convergence(l[len(l)//2:len(l)], t, epsilon)
            else:
                return l[-1] # return the max if it's less than our target, it means this whole space is worth playing with        
    else:
        raise IndexError("please insert a list")

def find_search_space(l:list, t, epsilon=0)->list:
    end_point = 0
    try:
        value = list_endpoint_convergence(l, t, epsilon)
        end_point = l.index(value)
    except Exception as e:
        print(e)
    finally:
        return l[0:end_point+1]

def summations(s_s:list, t, epsilon=0)->list:
    """
    We'll cover to summation cases,
    case 1: products from s_s.
            In this case, the challenge is:
                let k be our target and s_s be our search space,
                k = n x m
                where n E {s_s} and round(m)*((k/m)-round(k/m)) < 0.5 ... an acceptable condition for imperfect but close enough products. affecting the result by less than half.
            for v in s_s:
                m = k/v
                if round(m)*(m - round(m)) < 0.4:
                    t = (m, v)
                    res_space.append(t)
            this will give us all the possible muliplications we can come up with from the space. against the target.
    case 2: combinations
        In this case the challenge is:
            let k be our target and s_s be our search space,
            k = n+m+j ....
            where {n, j, m ....} E {s_s}
            stop condition:
                we add until the mid point.
            steps:
                1: Take the maximum
                for j in range(0, len(s_s)//2)
                    m = s_s[-1*j]
                    if m < k:
                        # start the rolling wheel ... from the back.
                        current = m
                        i = 0
                        while(current < k and i < len(s_s)//2)
                            current += s_s[i]
                            i += 1
                        if current > k:
                            # start the reversing wheel
                            j = 0
                            while(current > k  and j != i):
                                current -= s_s[j]
                                j += 1
                            if j == i and current > k: the stop condtion .... add everything until index before j
                                pull the result list and remove jth element and return
                        return result list. 
    """
    # for case 1
    res_list = repeated_sums(s_s, t)
    # for case 2
    res_list_2 = combinations(s_s, t)
    res_list_2.extend(res_list)
    
    return res_list_2

def repeated_sums(s_s, t, tolerance=0.8)->list:
    res_space = []
    scale = 1
    for v in s_s:
        
        r = t%v
        d = int(t//v)
        # print(d)
        if  d > 0 : # 
            temp = [v for x in range(0, d)]
            res_space.append(temp)
        # else: # imperfect multiplication needs summed compensation
        #     if d > 0:
        #         temp = [v for x in range(0, d)]
        #     else:
        #         temp = [v]

        #     # print("temp sum is:",sum(temp))
        #     s_t = sum(temp)
        #     diff = t-s_t
        #     # print(diff)
        #     if r > 0:
        #         compensation = combinations(s_s, v*r, 0)
        #         print("Compensation",compensation)
        #         print(t*r)
        #         # temp.append(compensation)
        #     res_space.append(temp)

    return res_space

def combinations(s_s, k, tolerance=0)->list:
    # print(s_s)
    res_list = []
    k = k+tolerance
    # print("k is -> ",k)
    incomp_list = []
    for j in range(1, len(s_s)):
        m = s_s[-1*j]
        # print("M is:",m)
        
        if m <= k:
            temp = []
            # start the rolling wheel ... from the back.
            current = m
            temp.append(m)
            i = 0
            while current < k and i < s_s.index(m):
                current += s_s[i]
                temp.append(s_s[i])
                i += 1
            if current > k:
                # start the reversing wheel
                j = 0
                cach = []
                while current > k  and j != i :
                    current -= s_s[j]
                    temp.remove(s_s[j])
                    cach.append(s_s[j])
                    j += 1

                if j == i and current != k:
                    cach.append(m)
                    cach.remove(s_s[j-1])
                    incomp_list.append(cach)
            s_t = sum(temp)
            if s_t != k:
                incomp_list.append(temp)
            elif (s_t > k-2 and s_t < k+2):
                res_list.append(temp)
    # pprint.pprint(res_list)
    # print(incomp_list)
    for i_c in incomp_list:
        s = sum(i_c)
        res = repeated_sums(s_s, k-s, 0.2)
        # print(res, "--> For the sum of: ", i_c, "The target: {} and the difference: {}".format(k, k-s))
        # print(res)
        if res:
            c_i_c = i_c.copy()
            for i in res:
                if len(i) > 0:
                    c_i_c.extend(i)
                    # print(c_i_c)
                    s = sum(c_i_c)
                    if (s > k-2 and s < k+2):
                        res_list.append(c_i_c)
                    c_i_c = i_c.copy()      
        else:
            s = sum(i_c)
            if (s > k-2 and s < k+2):
                res_list.append(i_c)
    # print(res_list)
    return res_list


class Node:
    def __init__(self, inverter:dict) -> None:
        self.__inverter = inverter
        self.__solar_panels = []
        self.__batteries = {} 
        self.__inverter_size = self.__inverter['size']['Size']['value'] # size in kVA


    def set_batteries(self, batteries):
        self.__batteries = batteries
    def set_panels(self, panels):
        self.__solar_panels = panels
    
    def get_size(self):return self.__inverter_size
    def get_packages(self):
        return {
            'back-up':self.get_backup_ps(),
            'bill-crusher':self.get_bill_crusher(),
            'hybrid':self.get_hybrid_systems()
        }

    def get_inverter_size(self):return self.__inverter_size

    def get_backup_ps(self):
        packages = []
        if len(self.__batteries) > 0:
            for i in self.__batteries:
                temp={
                    'characteristic':str(i)+' hr(s) battery backup',
                    'items':[self.__inverter.copy(), self.__batteries[i]],
                    'name': 'Back-up (UPS)',
                    'system-size':self.__inverter_size
                }
                try:
                    temp['img'] = temp['items'][1].get('image_url') 
                except Exception as e:
                    temp['img'] = temp['items'][1][0].get('image_url')
                packages.append(temp)
        else:
            raise ValueError('Please initialise batteries collection')

        return self.__compute_details(packages)

    def __compute_details(self, packages:list=[]):
        price = 0
        hash_string = ''
        for p in packages:
            for i in p.get('items'):
                if type(i) is dict:
                    # pprint.pprint(i.get('price'))
                    price += i.get('price')
                    hash_string += i.get('_uid')
                elif type(i) is list:
                    for j in i:
                        price += j.get('price')
                        hash_string += j.get('_uid')
            p['price'] = price
            p['hash_in'] = hash_string
            price = 0
            p['_uid'] = hashlib.sha512(bytes(hash_string, 'utf-8'), usedforsecurity=True).hexdigest()
            hash_string = ''
        return packages 


    def get_bill_crusher(self):
        packages = []
        if len(self.__solar_panels)>0 :
            temp={
                'characteristic': str(len(self.__solar_panels))+' x solar panels',
                'items':[self.__inverter.copy(), self.__solar_panels],
                'name':'Solar and Inverter',
                'system-size':self.__inverter_size
            }
            try:
                temp['img'] = temp['items'][1].get('image_url') 
            except Exception as e:
                temp['img'] = temp['items'][1][0].get('image_url')
            packages.append(temp)
        else:
            raise ValueError('Please initialise solar-panels collection')
        return self.__compute_details(packages)
    
    def get_hybrid_systems(self):
        packages = []
        if len(self.__batteries) > 0:
            for i in self.__batteries:
                temp={
                    'characteristic':str(i)+' hr backup + '+str(len(self.__solar_panels))+ ' x solar panels',
                    'items':[self.__inverter.copy(), self.__batteries[i], self.__solar_panels],
                    'name': 'Solar and Back-up',
                    'system-size':self.__inverter_size
                }
                try: # temporary code until I decide what I want to us on the image part.
                    temp['img'] = temp['items'][0].get('image_url') 
                except Exception as e:
                    temp['img'] = temp['items'][1][0].get('image_url')
                packages.append(temp)
        else:
            raise ValueError('Please initialise batteries collection')
        return self.__compute_details(packages)

    def __str__(self): return f"Inverter size is: {self.__inverter_size}"


def search_list(l, key, comp_cb=None):
    l.sort(key = comp_cb)
    def b_search_list(l, key, comp_cb=None):
        if len(l)>1:
            if comp_cb is None:
                if l[0] == key: return l[0]
                elif l[len(l)//2] == key: return l[len(l)//2]
                elif l[len(l)//2] > key: return b_search_list(l[0:len(l)//2], key, comp_cb)
                else: return b_search_list(l[len(l)//2:len(l)], key, comp_cb)
            else:
                if comp_cb(l[0]) == key: return l[0]
                elif comp_cb(l[len(l)//2]) == key: return l[len(l)//2]
                elif comp_cb(l[len(l)//2]) > key: return b_search_list(l[0:len(l)//2], key, comp_cb)
                else: return b_search_list(l[len(l)//2:len(l)], key, comp_cb)
        else:
            return None
    return b_search_list(l, key, comp_cb)

class PackageBuilder(Feature):
    def __init__(self) -> None:
        self._status = 0
        self._name =  ''
        self._data = None
        self._error = None
        self._config = None
        self._result = None
        self._output = None
        super().__init__()
        self.__inverter_nodes = []

    def open(self) -> bool:
        """
        Read data from the config variable and feature data from where-ever.
        store the data in self._data, this is where most of the feature's functionality will read
        when looking for data specific to the feature. in this case,
        package lists in a table.
        1) Open the configuration file to read all the necessary constraints,
        2) Organise data into a table with "inverters", "batteries" and "solar" etc, (store it in self._data)
        3) 

        i.e: You'll know how your data looks, so you'll handle it accordingly.
        """
        with open(CONFIG_DIR+'/package_configs.json') as f:
            config = json.load(f)
            self._config = config
        

        inverters = self._data.get('inverter')
        if inverters is None: inverters = []
        for i in inverters:
            new_node = Node(i)
            power = new_node.get_size()
            combinations = self.choose_batteries(power)
            # print(len(combinations))
            new_node.set_batteries(combinations)
            # set the panels here as well...
            new_node.set_panels(self.select_panels(new_node.get_size()))
            self.__inverter_nodes.append(new_node)

        self._status = 0x01

        return True

    def init(self, name, data, config=None) -> None:
        """
        We'll initialise variables in this section and deal with any other extras that we may need to initialise,
        as well as validation. 

        Later we'll implement a "feature" validation rule for security purposes.
        """
        super().init(name, data, config)

        self._data = data
        self.__name = name
        self.open()
        self._status = 0x02
        return None
    
    def process(self, lp=[]) -> bool:
        """
        this is where we'll generate the different packages... and store them in a file to read for filtering later.
        We'll create all possible packages on first go, and unless status changes to 0 we'll read from the 
        json file and run a filter and give output everytime.

        How many cases does this feature "process" ?
        1) Max-demand from Loading Profile. (will be part of "self._data)" under 'load_profile' key
        2) Initialise ... give 15 packages for each class... (Hybrid, Bill-Crusher, Back-up)
        3) 
        """
        super().process(lp)

        out = self._output
        self._output = []
        for node in self.__inverter_nodes:
            self._output.append(node.get_packages())
        

        # back-up all the work for later use...
        with open('package-groups.json', 'w') as f: # this ensures "availability" ... under no circumstance can we wind up with no data.
            f.write(json.dumps(self._output))

        return True
    
    def output(self) -> dict:
        super().output()
        """
        The output will be formed here.. in the form
        output = {
            'name':self._name,
            'data':self._result
        }
        this is the structure that the world will ever see...
        """
        self.process()

        return {'data':self._output, 'name':self._name}

    def error(self, err_obj) -> bool:
        """
        Receive error object,
        Every feature will handle it's own errors, the manage will only invoke this method and pass after that ....
        """
        return super().error(err_obj)

    # def build_data_struct(self, items_groups)->None:        
    #     pass

    def get_packages_for_lp(self, lp:list):
        """
        Generate packages that only fit the lp peak demand criteria.
        How we do this is:
        step 1: Get the peak demand from the lp.
        step 2: Find the inverter that is most suitable for the peak demand
        step 3: if we can't find it... then, remove max, and store it with it's index. (value, index)
        step 4: find the new max in the lp, repeat 1 to 3, then 4 until we find and inverter that fits.
        step 5: clean up and put everything back together
        step 6: build output and return
        """
        peak_demand = max(lp)
        res = search_list(self.__inverter_nodes, peak_demand, comp_cb=lambda iNode: iNode.get_size())
        if res is None: peak_demand = round(peak_demand)
        while(res is None and peak_demand >= 0):
            peak_demand -= 0.1
            peak_demand = round(peak_demand,2)
            res = search_list(self.__inverter_nodes, peak_demand, comp_cb=lambda iNode: iNode.get_size())
 
        if res is None:
            return {'packages':{}, 'max_demand':peak_demand, 'loading_profile':lp}

        return {'packages':res.get_packages(), 'max_demand':res.get_size(), 'loading_profile':lp}


    # solar algos
    def select_panels(self, inverter_size=3):
        """ 
        Very easy, what we do here is:
            1) select panels that match 80% of total power...
        """
        inverter_size *= 1000
        panels = self._data.get('solar')
        for p in panels:
            temp = []
            s = 0
            if p['size']['Power']['value'] < inverter_size:
                while(s < 0.8*inverter_size and len(temp)< 14):
                    s += p['size']['Power']['value']
                    temp.append(p.copy())
                return temp
        else: return panels[0]
            


    # battery algorithms...
    def choose_batteries(self, inverter_size=5):
        sym_list = self.get_battaries_symbolic_rep()
        batteries_list =  self._data.get('battery')
        target = 10 # compute the target P.t .. get t from configs... and P from current inverter...
        time = self._config.get('battery').get('config')

        battery_groups = {}
        # print(time)
        for t in time:
            target = inverter_size*t
            # print(target, "t = {}".format(t))
            combination = self.battery_selection_algo(target, batteries_list, sym_list)
            battery_groups[str(t)] = combination
        # pprint.pprint(battery_groups)

        with open('batteries-groups.json', 'w') as f:
            f.write(json.dumps(battery_groups))
        return battery_groups

    def battery_selection_algo(self, target:float, actual_data_batteries:list, symbolic_rep:list=None,  options={}):
        """
        Step 1: sort the list in case it's not sorted.... 
        step 2: validate the target to be numerical
        step 3: get the search space ... 
        step 4: get summations -> these are symbolic representations, find the actual objects in the symbolic combinantions.
        #### From step 5 downwards we drop the symbolic representations and work with actual objects...######
        step 5: pass it through the sigmoid squishification function to get the weights...
        step 6: get the weights matrix ... (symbolic representation of the actual data matrix.)
        step 7: get the smallest weight

        Args:
            target: float  -> the required energy in kWh (everything will be scaled to a good 1000)
            actual_data_batteries: list -> list of dict objects containing data about different batteries...
            symbolic_rep: list -> list of numerical data (energy in kwh) following the same sequence as the actual list.
            options: dict -> for future upgrades, to allow more lists than that of batteries.
        Return:
            list -> list of optimal battery combinations to achieve target... weighed on price against energy...
        """
        if symbolic_rep is None: # we only recieved data ... check the options for the keys... (later updates)
            pass
        
        actual_data_batteries.sort(key=lambda d: d['size']['Energy']['value'])
        symbolic_rep.sort()

        if type(target) is float or type(target) is int:
            pass
        else: 
            raise TypeError("Target must be of type Int of Float (numerical)")

        s_s = find_search_space(symbolic_rep, target, 0)
        combinations = summations(s_s, target)
        real_combinations = self.map_symbolic_reps(actual_data_batteries, symbolic_rep, combinations)
        price_energy_ratios = self.get_weights(real_combinations, combinations, target)
        choice_selected = min(price_energy_ratios)
        # pprint.pprint(combinations)
        # # pprint.pprint(price_energy_ratios)
        # pprint.pprint(combinations[price_energy_ratios.index(choice_selected)])
        # print(target)
        # print('------')
        return real_combinations[price_energy_ratios.index(choice_selected)]
    
    def map_symbolic_reps(self, actual, sym_list, combs)->list:
        """
        This method will map the combinations to real objects ...
        """
        out_put_list = []
        for comb in combs:
            temp = []
            for item in comb:
                ind = sym_list.index(item)
                temp.append(actual[ind].copy())
            out_put_list.append(temp)
        return out_put_list

    def get_weights(self, actual_bat_combinations, sym_combinations, actual=0):
        output_list = []
        for comb in actual_bat_combinations:
            total = 0
            energy = sum(sym_combinations[actual_bat_combinations.index(comb)])
            for battery in comb:
                total += battery.get('price')
            price_per_kwh = total/(energy*1000)
            weight = ((price_per_kwh)+(len(comb)*0.5) + (actual-energy)*5)/10
            output_list.append(weight)

        return output_list

    def get_battaries_symbolic_rep(self):
        batteries = self._data.get('battery')
        sym_list = []
        for i in batteries:
            sym_list.append(i['size']['Energy']['value'])
        return sym_list
    