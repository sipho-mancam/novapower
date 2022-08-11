

from features import Feature
import pathlib
import json
import numpy as np

CONFIG_DIR_STR = __file__+"/../../configs/"

CONFIG_DIR = pathlib.Path(CONFIG_DIR_STR).resolve().__str__()

class PackageBuilder(Feature):
    def __init__(self) -> None:
        self._status = 0
        self._name =  ''
        self._data = None
        self._error = None
        self._config = None
        self._result = None
        super().__init__()

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
        print(config)


        return super().open()

    def init(self, name, config, data) -> None:
        """
        We'll initialise variables in this section and deal with any other extras that we may need to initialise,
        as well as validation. 

        Later we'll implement a "feature" validation rule for security purposes.
        """
        return super().init(name, config, data)
    
    def process(self) -> bool:
        """
        this is where we'll generate the different packages... and store them in a file to read for filtering later.
        We'll create all possible packages on first go, and unless status changes to 0 we'll read from the 
        json file and run a filter and give output everytime.
        """

        return super().process()
    
    def output(self) -> dict:
        """
        The output will be formed here.. in the form
        output = {
            'name':self._name,
            'data':self._result
        }
        this is the structure that the world will ever see...
        """
        return super().output()

    def error(self, err_m) -> bool:
        """
        Still meditating about the error handling methods that would best suit features in general
        """
        return super().error(err_m)

    def build_data_struct(self, items_groups)->None:        
        pass

    def selection_algo(self, sel_space, target):
        pass

package_builder = PackageBuilder()

# package_builder.open() 

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
    res_list_2 = combinations(s_s, t, -1*t*0.15)
    res_list_2.extend(res_list)
    
    return res_list_2

def repeated_sums(s_s, t, tolerance=0.02)->list:
    res_space = []
    for v in s_s:
        d = t/v
        # print((round(d)*(d-round(d)))<tolerance, (round(d)*(d-round(d))), v, round(d))
        if round(d)>=1 and round(d)*(d-round(d)) < tolerance:
            temp = [v for x in range(0,round(d))]
            res_space.append(temp)
    return res_space

def combinations(s_s, k, tolerance=0)->list:
    res_list = []
    k = k+tolerance
    incomp_list = []
    for j in range(1, len(s_s)//2):
        m = s_s[-1*j]
        # print("M is:",m)
        if m <= k:
            temp = []
            # start the rolling wheel ... from the back.
            current = m
            temp.append(m)
            i = 0
            while current < k and i < len(s_s)//2:
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

            if sum(temp) != k:
                incomp_list.append(temp)
            else:
                res_list.append(temp)
    # print(incomp_list)
    for i_c in incomp_list:
        s = sum(i_c)
        # res = repeated_sums(s_s, k-s, 0.2)
        res = []
        # print(res, "--> For the sum of: ", i_c, "The target: {} and the difference: {}".format(k, k-s))
        if res and len(res[0]) > 0:
            i_c.extend(res[0])
        res_list.append(i_c)
    # print(res_list)
    return res_list


# import random

# randomlist = random.sample(range(1, 100), 80)

# randomlist.sort()

# target = 50

# s_s = find_search_space(randomlist, target)
# print(s_s)
# print(randomlist)