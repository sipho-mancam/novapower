

class Package:
    def __init__(self, metadata:dict=None, t_price:float=0.0)->None:
        self.__metadata = metadata
        self.__t_price = t_price
    

    def _get_cost(self):
        return self.__t_price

class PackageList(list):
    def __init__(self,l:list=[])->None:
        super.__init__(self, t, obj)