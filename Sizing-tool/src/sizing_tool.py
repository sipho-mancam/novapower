"""
This is the systems entry point...
where the input and output to and from the system will happen.
"""

from core.core import Core


class SizingTool:
    def __init__(self, data):
        self.__core = Core(data)
        self.__data = {}
        

    def get_properties(self, num_of_bedrooms:int)->dict:
        return self.__core.get_property(num_of_bedrooms)
    
    def get_packages(self, loading_profile:list)->dict:
        return self.__core.get_packages(loading_profile)
    
    def init(self, data):
        self.__data = data
        self.__core = Core(data)
        