
# Item constants
ID = '_id'
CLASS = 'class'
PRICE = 'price'
IMG_URL='img_url'
DESCRIPTION = 'description'
OPTIONS='options'

# class definitions

CL_SOLAR='solar'
CL_INVERTER='inverter'
CL_BATTERY='battery'
CL_CABLING='cabling'
CL_RACKING='racking'

# Database names constants
DB_ITEMS='items-db'
DB_ORDERS='orders-db'
DB_USERS='user-db'
DB_MAIN='main-db'
DB_TEST='test-db'

#collection names constants
COL_SOLAR="solar-collection"
COL_INVERTER="inverter-collection"
COL_BATTERY="battery-collection"
COL_CHARGER='charger-collection'
COL_RACKING='racking-collection'
COL_UAC='uac-collection' # USER ACCESS CONTROL
COL_COMP_ORDERS='comp-order-collection' # completed orders
COL_PENDING_ORDERS='pending-orders-collection'
COL_MAIN='main-collection'
COL_TEST='test-collection'

valid_collection_list = [
    COL_SOLAR,
    COL_INVERTER,
    COL_BATTERY,
    COL_CHARGER,
    COL_RACKING,
    COL_UAC, # USER ACCESS CONTROL
    COL_COMP_ORDERS, # completed orders
    COL_PENDING_ORDERS,
    COL_MAIN,
    COL_TEST
]

# set up constants

DEBUG=True
HOST='0.0.0.0'

D_HOST = 'localhost'
D_PORT = 27017

