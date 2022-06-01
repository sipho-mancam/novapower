# initialize the db
# initialize the flask webserver
# initialize package manager
# initialize the programms main class - Entry points
# initialize the kafka connector
# set up the validator  qw

from mongo_broker import *
from package_manager import PManager
import CONSTANTS
from App import get_app_instance



class Main:
    def __init__(self, config:dict=None)->None:
        self.__package_manager = None
        self.__app = None
        self.__db_client =None
    
    def setup(self):
        self.__db_client = connect(D_HOST, D_PORT)
        
        if self.__db_client is not None:
            self.__package_manager = PManager(self.__db_client, 
                                            self.__db_client[CONSTANTS.DB_MAIN],
                                            CONSTANTS.COL_MAIN,
                                            {})
            print("[+] Package manager setup with default values - Mian DB and Collection")
        self.__app = get_app_instance()
        self.init()

    def init(self):
        self.__app.run(host=CONSTANTS.HOST, debug=CONSTANTS.DEBUG)


main = Main()

main.setup()
