"""
This module is the core of the system, all computations are facilitated here ... 
All subsystems shall receieve the loading profile as their base parameter.
"""

import sys
import pathlib
sys.path.append(pathlib.Path(__file__+"/../../features/").resolve().__str__())


import numpy as np
# import features
from features import Feature
from package_builder import PackageBuilder
from prop_loading import LPBuilder
from prop_loading import PropertyBuilder


class Core:
    def __init__(self, data:dict) -> None:
        self.__features_wheel =  {}
        self.__package_builder = PackageBuilder()
        self.__data = data
        self.__loading_profile = LPBuilder()
        self.__property_builder = PropertyBuilder()
        self.__package_builder = PackageBuilder()
        # initialise all the base objects that need to be initialised

    def register_feature(self, f_name:str, feature:Feature, data={})->bool:
        if issubclass(feature, Feature):
            feature.init(f_name, data)
            self.__features_wheel[f_name]={'feature':feature, 'name':f_name, 'data':data}
        else:
            raise TypeError('Only children of the {} class, can be registered'.format(Feature)) 
        return True

    def run_wheel(self):
        """
        Start running the wheel, and load all the features sequentially, 

        All the features must receive a loading profile.
        """
        res = []
        for f in self.__features_wheel:
            try:
                if self.__features_wheel[f].process():
                    out = self.__features_wheel[f].output()
                    res.append(out)
            except Exception as e:
                self.__features_wheel[f]['feature'].error(e)
                
        return res


    def get_packages(self, loading_profile:list)->dict:
        return self.__package_builder.get_packages(loading_profile)

    def get_property(self, num_of_bedrooms:int)->dict:
        return self.__property_builder.build_property(num_of_bedrooms)



