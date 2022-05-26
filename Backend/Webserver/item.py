
class Item:
    def __init__(self, id:str, cl:str, price:float, desc:str, img_url:str ) -> None:
        self.__id = id
        self.__cl = cl
        self.__price = price
        self.__description = desc
        self.__img_url = img_url

    def to_dict(self)->dict:
        return{
            "id":self.__id,
            "cl":self.__cl,
            "price":self.__price,
            "description":self.__description,
            "img_url":self.__img_url
        }
    def to_json(self)->str:
        return str(self.to_dict())
    
    # property control functions
    def __str__(self):
        return self.to_json()

    def __eq__(self, __o:object) -> bool:
        return self.__price ==  __o.__price

    def __lt__(self, __o:object) -> bool:
        return self.__price <  __o.__price

    def __gt__(self, __o:object) -> bool:
        return self.__price >  __o.__price

    def __ge__(self, __o:object)->bool:
        return self.__price >=  __o.__price
    
    def __le__(self, __o:object)-> bool:
        return self.__price <=  __o.__price
        


print(Item("id", "cl", 0.1, "some", "/sad") <= Item("id", "cl", 0.2, "some", "/sad") )
