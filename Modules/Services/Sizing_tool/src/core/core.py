"""
This module is the core of the system, all computations are facilitated here ... 
All subsystems shall receieve the loading profile as their base parameter.
"""

import sys
import pathlib
sys.path.append(pathlib.Path(__file__+"/../../features/").resolve().__str__())
sys.path.append(pathlib.Path(__file__+"/../").resolve().__str__())

from features import Feature
from package_builder import PackageBuilder
from prop_loading import LPBuilder
from prop_loading import PropertyBuilder


class Core:
    def __init__(self, data:dict) -> None:
        self.__features_wheel =  {}
        self.__features_wheel_r =  {}
        self.__package_builder = PackageBuilder()
        self.__data = data
        self.__loading_profile = LPBuilder()
        self.__property_builder = PropertyBuilder()
        self.__package_builder = PackageBuilder()
        # initialise all the base objects that need to be initialised
        self.__package_builder.init('package-builder', self.__data)

    def init(self):
        """
        step 1: read the file containing feature prints
        step 2: Initialise the features and load them up for running
        step 3: 
        """
        pass

    def get(self, key:str):
        if key.lower() =='package-builder' or key.lower() =='packagebuilder' or key.lower() =='package_builder':
            return self.__package_builder

        if key.lower() == 'property' or key.lower() == 'property-builder' or key.lower() == 'propertybuilder':
            return self.__property_builder

    def register_feature(self, f_name:str, feature:Feature, data={})->bool:
        """
        Register the feature class templates here...
        The program will run the init function upon start up and create all the objects...

        """
        if issubclass(feature, Feature):
            self.__features_wheel_r[f_name]={'feature':feature, 'name':f_name, 'data':data}
            with open('./registered-features.obj', 'ab') as f:
                f.write({'feature':feature, 'name':f_name, 'data':data})
        else:
            raise TypeError('Only children of the {} class, can be registered'.format(Feature)) 
        return True

    
    def run_wheel(self, lp=[]):
        """
        Start running the wheel, and load all the features sequentially, 
        All the features must receive a loading profile.
        """
        res = []
        for f in self.__features_wheel:
            try:
                if self.__features_wheel[f].process(lp):
                    out = self.__features_wheel[f].output()
                    res.append(out)
            except Exception as e:
                self.__features_wheel[f]['feature'].error(e) 
        return res


    def get_packages(self, loading_profile:list)->dict:
        return self.__package_builder.get_packages_for_lp(loading_profile)
    
    def get_packages(self, house_model:dict)->dict:
        lp = house_model.get('loading-profile')
        return self.__package_builder.get_packages_for_lp(lp)

    def get_property(self, num_of_bedrooms:int)->dict:
        return self.__property_builder.build_property(num_of_bedrooms)

    def process_loading(self, loading:dict)->dict:
        """
        step 1: run the profile through package builder...
        step 2: pass the lp to the wheel and run the wheel
        step 3: merge results from wheel with those from the package builder
        step 4: give out a unified result in the form:
                output = {
                    'loading-profile': lp,
                    'packages': package-builder(res),
                    'features':{
                        'name of feature': result,
                    }
                }
        """
        if type(loading) is dict: # it's a house model
            lp = loading.get('loading-profile')
        elif type(loading) is list: # it's a stand-alone profile
            lp = loading

        package_b = self.__package_builder.get_packages_for_lp(lp)
        features_res = self.run_wheel(lp)

        output = {
            'loading-profile':lp,
            'packages': package_b,
            'features': features_res
        }

        return output


