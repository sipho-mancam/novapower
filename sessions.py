from concurrent.futures import thread
import hashlib
import _thread
import time

class Session:
    def __init__(self, _id:str):
        self.__hashing_object = hashlib.sha512(bytes(_id, 'utf-8'), usedforsecurity=True)
        self.__uid = self.__hashing_object.hexdigest()
        self.__expired = False
        self.__ended = False
        self.__session_data = {}
        self.__next_obj = None

    def get_session_id(self):
        return self.__uid   

    def is_id(self, id)->True:
        if id == self.__uid:return True
        elif self.__next_obj:
            return self.__next_obj.is_id(id)
        return False 

    def count_down(self, n):
        start = n
        while start >0:
            time.sleep(1)
            start -= 1
        self.__expired = True
        return

    def start_session(self):
        _thread.start_new_thread(self.count_down, (20))
    
    def end_session(self):
        _thread.exit()
        self.__ended = True

    def is_expired(self):
        return self.__expired

    def is_ended(self):return self.__ended
