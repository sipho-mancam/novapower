"""
This is the abstract class / Interface to which all features shall be derived.

Feautures can perform all sorts of tasks, all they have to do is conform to that base template,

from there you can write it to whatever you want.
"""
from abc import ABC, abstractmethod
class Feature(ABC):
    def __init__(self) -> None:
        super().__init__()
        #protected data members
        self._status
        self._name
        self._data
        self._error 
        self._config
        self._result
        self._output

    # after initilising variables, we open the feature, performing all configurations and all the neccessary I/Os needed before feature can work
    @abstractmethod
    def open(self)->bool:
        pass

    # entry point to the feature... initialise it with the data it needs (called internally by the manager to start any feature.)
    @abstractmethod
    def init(self, name, config, data)->None:
        pass
    
    # called internally by the manager to perform the objects duties ... always called before output
    # if it returns true, start the process to send output otherwise raise exception
    @abstractmethod
    def process(self)->bool:
        pass

    # method to send output to the outside world
    @abstractmethod
    def output(self)->dict:
        pass
    
    #method to handle all the features error if any handling mechanism is defined.
    @abstractmethod
    def error(self, err_m)->bool:
        pass

