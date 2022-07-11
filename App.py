from crypt import methods
from flask import Flask, redirect, render_template, request, jsonify, send_from_directory, session, url_for
from flask_cors import CORS
from flask_session import Session
from package_manager import *
import CONSTANTS
from packages import *
from init import *
import datetime
from pdf_gen import generate_pdf
from utility import update_cart
from sizing_tool import INPUT_SHEET_NAME, OUTPUT_SHEET_NAME, read_sheet, write_sheet
import pathlib
from pricing import *
from pymongo import MongoClient
from parser import Parser

app = Flask(__name__)

client = MongoClient("mongodb+srv://sipho-mancam:Stheshboi2C@cluster0.silnxfe.mongodb.net/sessions?retryWrites=true&w=majority")

app.secret_key = hashlib.sha256(randbytes(256), usedforsecurity=True).hexdigest()
app.config['UPLOAD_FOLDER'] = pathlib.Path('./Quotes/').absolute().as_posix()
# app.config['MONGO_DBNAME'] = 'sessions'
# app.config['MONGO_URI'] = 'mongodb+srv://sipho-mancam:Stheshboi2C@cluster0.silnxfe.mongodb.net/sessions?retryWrites=true&w=majority'
# app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'mongodb'
app.config['SESSION_MONGODB'] = client
app.config['SESSION_MONGODB_DB'] = 'sessions'
app.config['SESSION_MONGODB_COLLECTION'] = 'user-sessions'

Session(app)

db_manager, clnt = setup()
# print(db_manager.read_all())
data_path = './DatabaseIndividualPricingInputFormat v2.xlsx'
solar_package_handler = setup_input(data_path, 'Sheet 1', keys=['solar', 'inverter', 'battery']);
inverter_package_handler = setup_input(data_path, 'Sheet 1', keys=['inverter', 'battery'])
generator_package_handler = setup_input(data_path,'Sheet 1', keys=['generator'])

admin_creds =  session_token = hashlib.sha512(bytes('admin@novapoweradmin@admin', 'utf-8'), usedforsecurity=True).hexdigest()

s = 0

def validate_session(token):
    if token in session:
        return True
    return False

inverter_package_handler.generate_package(1)


# pprint.pprint(inverter_package_handler.get_summary())

package_table = {
    'generator':generator_package_handler.get_summary(),
    'solar':solar_package_handler.get_summary(),
    'inverter':inverter_package_handler.get_summary()
}

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('store.html')

@app.route('/store', methods=['GET'])
def store():
    return render_template('store.html')

@app.route('/cart', methods=['GET'])
def cart():
    return render_template('cart.html')

@app.route('/sizing', methods=['GET'])
def sizing():
    return render_template('sizing.html')

@app.route('/favicon', methods=['GET'])
def favicon():
    return "https://play-lh.googleusercontent.com/i_qY-W18INRV9PsVvnMtYUx4A8Skbu_gOEa8ncAnltRoU9c9nyMws_Pc_iQNtxNzZw"

@app.route('/admin', methods=['GET'])
def admin():
    session_token = request.args.get('session_token')
    if session_token in session:
        return render_template('admin.html')
    else:
        return redirect('admin-login');

@app.route('/admin-login', methods=['GET'])
def admin_login():
    if request.method == 'GET':
        return render_template('a_login.html') 


@app.route('/admin-login-d', methods=['POST'])
def admin_login_d():
    user_creds = request.form.to_dict()
    s = ''
    for k in user_creds:
        s += user_creds[k]
    session_token = hashlib.sha512(bytes(s, 'utf-8'), usedforsecurity=True).hexdigest()
    if session_token == admin_creds:
        session[session_token] ={}
        session.modified = True
        return redirect(f'admin?session_token={session_token}')
    else: return {'response':'Incorrect Creds'} 
    

@app.route('/admin/get_quotes', methods=['GET'])
def admin_get_quotes():
    session_token = request.args.get('session_token')
    if session_token in session:
        res = db_manager._read_records(db_manager.get_current_db(), 'user-quotes', {})
        res_json = {}
        counter = 0
        for i in res:
            i['_id'] = str(i['_id'])
            res_json[counter] = i
            counter += 1
        # pprint.pprint(res_json)
        return res_json
    else: return {
        'res':0x05
    }



@app.route('/packages/all', methods=['GET', 'OPTIONS']) # require a sesson token to send data
def index_data():
    n = request.args.get('n')
    i = int(n)
    solar_package_handler.generate_package(i)
    inverter_package_handler.generate_package(10)
    generator_package_handler.generate_package()
    solar_packages = {
        "package 0":{
            "item 0": {
                "brand":"RCT -AXPERT",
                "name":"Inverter",
                "package-flag":False,
                "package-group":"Inverters",
                "size":{
                    "Size":{"unit":"kVA", "value": 3},
                    "Voltage":{"unit":"V", "value":48},
                    "Power":{"unit":"kW", "value":3},
                    "MPPTVoltage":{"unit":"V", "value":430}
                },
                "image_url":"https://i.ibb.co/jzvdLNV/Solar-1-RCT-Axpert.png",
                "type-group":"Stand-alone",
                "price":10471.90,
                "qty":1
            },
            "item 1": {
                "brand":"Dyness",
                "name":"Battery",
                "package-flag":False,
                "package-group":"Batteries",
                "size":{
                    "Voltage":{"unit":"V", "value":48},
                    "Energy":{"unit":"kWh", "value":2.4}
                },
                "type-group":"Lithium-ion",
                "price":13549.30,
                "qty":1
            },
            "item 2": {
                "brand":"CNBM",
                "name":"Solar",
                "package-flag":False,
                "package-group":"Solar",
                "size":{
                    "Voltage":{"unit":"V", "value":37.5},
                    "Power":{"unit":"W", "value":330}
                },
                "type-group":"Polycrystalline",
                "price":15525,
                "qty":6
            },
            "max-power":3,
            "solar-qty":6,
            "total-price":39546.20
        },

        "package 1":{
            "item 0": {
                "brand":"RCT -AXPERT",
                "name":"Inverter",
                "package-flag":False,
                "package-group":"Inverters",
                "image_url":"https://i.ibb.co/RHYp9xP/Solar-2.png",
                "size":{
                    "Size":{"unit":"kVA", "value": 3},
                    "Voltage":{"unit":"V", "value":48},
                    "Power":{"unit":"kW", "value":3},
                    "MPPTVoltage":{"unit":"V", "value":430}
                },
                "type-group":"Stand-alone",
                "price":10471.90,
                "qty":1
            },
            "item 1": {
                "brand":"Fusion",
                "name":"Battery",
                "package-flag":False,
                "package-group":"Batteries",
                "size":{
                    "Voltage":{"unit":"V", "value":48},
                    "Energy":{"unit":"kWh", "value":4.8}
                },
                "type-group":"Lithium-ion",
                "price":26444.25,
                "qty":1

            },
            "item 2": {
                "brand":"CNBM",
                "name":"Solar",
                "package-flag":False,
                "package-group":"Solar",
                "size":{
                    "Voltage":{"unit":"V", "value":37.5},
                    "Power":{"unit":"W", "value":330}
                },
                "type-group":"Polycrystalline",
                "price":20700,
                "qty":8
            },
            "max-power":3,
            "solar-qty":8,
            "total-price":57616.15
        },

        "package 2":{
            "item 0": {
                "brand":"RCT -AXPERT",
                "name":"Inverter",
                "package-flag":False,
                "package-group":"Inverters",
                "image_url":"https://i.ibb.co/PWZPqsY/Solar-3.png",
                "size":{
                    "Size":{"unit":"kVA", "value": 5},
                    "Voltage":{"unit":"V", "value":48},
                    "Power":{"unit":"kW", "value":5},
                    "MPPTVoltage":{"unit":"V", "value":115}
                },
                "type-group":"Stand-alone",
                "price":15234.05,
                "qty":1
            },
            "item 1": {
                "brand":"Fusion",
                "name":"Battery",
                "package-flag":False,
                "package-group":"Batteries",
                "size":{
                    "Voltage":{"unit":"V", "value":48},
                    "Energy":{"unit":"kWh", "value":4.8}
                },
                "type-group":"Lithium-ion",
                "price":26444.25,
                "qty":1

            },
            "item 2": {
                "brand":"Canadian Solar",
                "name":"Solar",
                "package-flag":False,
                "package-group":"Solar",
                "size":{
                    "Voltage":{"unit":"V", "value":34.09},
                    "Power":{"unit":"W", "value":375}
                },
                "type-group":"monocrystalline",
                "price":29072,
                "qty":8
            },
            "max-power":5,
            "solar-qty":8,
            "total-price":70750.30
        },

        "package 3":{
            "item 0": {
                "brand":"RCT -AXPERT",
                "name":"Inverter",
                "package-flag":False,
                "package-group":"Inverters",
                "image_url":"https://i.ibb.co/RYww1C6/Solar-4.png",
                "size":{
                    "Size":{"unit":"kVA", "value": 5},
                    "Voltage":{"unit":"V", "value":48},
                    "Power":{"unit":"kW", "value":5},
                    "MPPTVoltage":{"unit":"V", "value":115}
                },
                "type-group":"Stand-alone",
                "price":15234.05,
                "qty":1
            },
            "item 1": {
                "brand":"Fusion",
                "name":"Battery",
                "package-flag":False,
                "package-group":"Batteries",
                "size":{
                    "Voltage":{"unit":"V", "value":48},
                    "Energy":{"unit":"kWh", "value":9.6}
                },
                "type-group":"Lithium-ion",
                "price":52888.50,
                "qty":2

            },
            "item 2": {
                "brand":"Canadian Solar",
                "name":"Solar",
                "package-flag":False,
                "package-group":"Solar",
                "size":{
                    "Voltage":{"unit":"V", "value":34.09},
                    "Power":{"unit":"W", "value":375}
                },
                "type-group":"monocrystalline",
                "price":36340,
                "qty":10
            },
            "max-power":5,
            "solar-qty":10,
            "total-price":104462.55
        },
        "package 4":{
            "item 0": {
                "brand":"RCT -AXPERT",
                "name":"Inverter",
                "package-flag":False,
                "package-group":"Inverters",
                "image_url":"https://i.ibb.co/PCYpsQF/Solar-5.png",
                "size":{
                    "Size":{"unit":"kVA", "value": 8},
                    "Voltage":{"unit":"V", "value":48},
                    "Power":{"unit":"kW", "value":8},
                    "MPPTVoltage":{"unit":"V", "value":66}
                },
                "type-group":"Stand-alone",
                "price":41260.85,
                "qty":1
            },
            "item 1": {
                "brand":"Fusion",
                "name":"Battery",
                "package-flag":False,
                "package-group":"Batteries",
                "size":{
                    "Voltage":{"unit":"V", "value":48},
                    "Energy":{"unit":"kWh", "value":9.6}
                },
                "type-group":"Lithium-ion",
                "price":52888.50,
                "qty":2

            },
            "item 2": {
                "brand":"Canadian Solar",
                "name":"Solar",
                "package-flag":False,
                "package-group":"Solar",
                "size":{
                    "Voltage":{"unit":"V", "value":34.09},
                    "Power":{"unit":"W", "value":375}
                },
                "type-group":"monocrystalline",
                "price":36340,
                "qty":10
            },
            "max-power":8,
            "solar-qty":10,
            "total-price":130489.35
        },
        "package 5":{
            "item 0": {
                "brand":"RCT -AXPERT",
                "name":"Inverter",
                "package-flag":False,
                "package-group":"Inverters",
                "image_url":"https://i.ibb.co/sK5xwpy/Solar-6.png",
                "size":{
                    "Size":{"unit":"kVA", "value": 8},
                    "Voltage":{"unit":"V", "value":48},
                    "Power":{"unit":"kW", "value":8},
                    "MPPTVoltage":{"unit":"V", "value":66}
                },
                "type-group":"Stand-alone",
                "price":41260.85,
                "qty":1
            },
            "item 1": {
                "brand":"Fusion",
                "name":"Battery",
                "package-flag":False,
                "package-group":"Batteries",
                "size":{
                    "Voltage":{"unit":"V", "value":48},
                    "Energy":{"unit":"kWh", "value":9.6}
                },
                "type-group":"Lithium-ion",
                "price":52888.50,
                "qty":2

            },
            "item 2": {
                "brand":"Canadian Solar",
                "name":"Solar",
                "package-flag":False,
                "package-group":"Solar",
                "size":{
                    "Voltage":{"unit":"V", "value":34.09},
                    "Power":{"unit":"W", "value":375}
                },
                "type-group":"monocrystalline",
                "price":43608,
                "qty":12
            },
            "max-power":8,
            "solar-qty":12,
            "total-price":137757.35
        },
        "package 6":{
            "item 0": {
                "brand":"RCT -AXPERT",
                "name":"Inverter",
                "package-flag":False,
                "package-group":"Inverters",
                "image_url":"https://i.ibb.co/hDCBkYX/Solar-7.png",
                "size":{
                    "Size":{"unit":"kVA", "value": 8},
                    "Voltage":{"unit":"V", "value":48},
                    "Power":{"unit":"kW", "value":8},
                    "MPPTVoltage":{"unit":"V", "value":66}
                },
                "type-group":"Stand-alone",
                "price":41260.85,
                "qty":1
            },
            "item 1": {
                "brand":"Fusion",
                "name":"Battery",
                "package-flag":False,
                "package-group":"Batteries",
                "size":{
                    "Voltage":{"unit":"V", "value":48},
                    "Energy":{"unit":"kWh", "value":14.4}
                },
                "type-group":"Lithium-ion",
                "price":79332.75,
                "qty":3

            },
            "item 2": {
                "brand":"Canadian Solar",
                "name":"Solar",
                "package-flag":False,
                "package-group":"Solar",
                "size":{
                    "Voltage":{"unit":"V", "value":34.09},
                    "Power":{"unit":"W", "value":375}
                },
                "type-group":"monocrystalline",
                "price":50876,
                "qty":14
            },
            "max-power":8,
            "solar-qty":14,
            "total-price":171469.60
        }
    }
    for package in solar_packages:
        solar_packages[package]['_uid'] = hashlib.sha256(bytes(solar_packages[package].__str__(), 'utf-8'), usedforsecurity=True).hexdigest()
        for item in solar_packages[package]:
            if type(solar_packages[package][item]) is dict:
                solar_packages[package][item]['_uid'] =  hashlib.sha256(bytes(solar_packages[package][item].__str__(), 'utf-8'), usedforsecurity=True).hexdigest()

    package_table = {
        'solar':solar_packages,
        'inverter':inverter_package_handler.get_summary(),
        'generator':generator_package_handler.get_summary()
    }
   
    return package_table



@app.route('/session', methods=['GET'])
def generate_session():
    session_id = request.args.get('session_id')
    session_token = hashlib.sha512(bytes(session_id, 'utf-8'), usedforsecurity=True).hexdigest()
    if session_token not in session:
        session[session_token] = {
            'id': session_token,
            'start-time':datetime.datetime.now().strftime("%H:%M:%S"),
            'data': {
                'cart':[],
                'price':{},
                'processed-list':[] 
            }
        }
        session.modified=True
    return {'session_token':session_token}

@app.route('/featured', methods=['GET'])
def get_featured_products():
    session_token = request.args.get('session_token')
    # print(session)
    if validate_session(session_token):
        n = request.args.get('n')
        if n is not None:
            x = int(n)
        else:
            x = 10

        solar_package_handler.generate_package(x//2)
        inverter_package_handler.generate_package(x//2)
        generator_package_handler.generate_package(x//2)
        return {
            'solar':solar_package_handler.get_summary(),
            'inverter':inverter_package_handler.get_summary(),
            'generator':generator_package_handler.get_summary(),
        }
    else:
        return {
            'status':0x05,
            'response':'Invalid session token'
        }


def validate_cart_object(schema:dict, data:dict):
    return True


@app.route('/add-to-cart', methods=['POST', 'PUT'])
def add_to_session_cart():
    session_token = request.args.get('session_token')
    data = request.get_json()
    # print(data)
    if session_token in session:
        user_data = session[session_token]
        if 'cart' in user_data['data']:
            res = update_cart(data['_uid'], user_data['data']['cart'])
            if not res:
                session[session_token]['data']['cart'].append(data)    
            session.modified = True
        else:
            session[session_token]['data']['cart'] = []
            session[session_token]['data']['cart'].append(data)
            session.modified = True
        return {'response':0x01}
    else:
        return {'response':0x05}


@app.route('/update-cart', methods=['POST'])
def update_cart_items():
    session_token = request.args.get('session_token')
    data = request.get_json()
    func = request.args.get('func')
    if session_token in session:
        user_data = session[session_token]['data']
        res = update_cart(data['_uid'], user_data['cart'], func)
        session.modified = True
        if res: return {func:'Sucessful'};
        else: return {func:'Failed'}
    return {'response':0x05}


@app.route('/get-cart', methods=['GET'])
def get_cart_items():
    m = request.args.get('m')
    session_token = request.args.get('session_token')
    if session_token in session:
        data = session[session_token]['data']
        if m == 'count': # give me the number of items in the cart...
            if 'cart' in data:
                cart = data['cart']
                return {'cart-items-count':len(cart)}
            else:
                return {'cart-items-count':0}
        elif m == 'items':
            if 'cart' in data:
                cart = data['cart']
                return {'cart-items':cart}
            else:
                return {'cart-items':0}
    else:
        return {'response':0x05}


@app.route('/get-quote', methods=['GET', 'POST'])
def get_quote():
    if request.method == 'POST':
        session_token = request.args.get('session_token')
        user_info = request.get_json()
        if session_token in session:
            data = session[session_token]['data']
            p = generate_pdf(user_info['name']+'.pdf', data['cart'], user_info)
            data['quote'] = p.name
            session.modified = True
            user_info['cart-list'] = data['cart']
            
            #update the db with new user info
            db_manager._delete_record(_query=user_info)
            db_manager._insert_record(db_manager.get_current_db(), 'user-quotes', user_info)

            return {'filename':p.name}
    elif request.method == 'GET':
        session_token = request.args.get('session_token')
        if session_token in session:

            return send_from_directory(app.config['UPLOAD_FOLDER'], session[session_token]['data']['quote']) 
        else:
            return {'response':0x05}

@app.route('/price-summary')
def price_summary():
    session_token = request.args.get('session_token')
    if session_token in session:
        data = session[session_token]['data']
        cart_list = data['cart']
        res = process_cart_pricing(cart_list, session_token, data['processed-list'])
        res = res.get_totals()
        session.modified = True
        for key in res.keys():
            res[key] = format_price(res[key])
        return res
    else:
        return {'response':0x05}

@app.route('/add-option', methods=['POST', 'GET'])
def add_option():
    if request.method == 'GET':
        session_token = request.args.get('session_token')
        options_list = [installers_option]
        if session_token in session:
            data = session[session_token]['data']
            res = add_options_to_all(session_token, data, options_list)

            res = res.get_totals()
            for key in res.keys():
                res[key] = format_price(res[key])
            return res
        else:
            return {'response':0x05}
    else:
        return {'status':0x05}


@app.route('/size-me', methods=['POST'])
def sizeme():
    data = request.get_data(cache=True, as_text=True)
    json = request.get_json(cache=True, force=True)
    # Need to create a queuing system here to make sure we take care of races...

    res = create_ss_list(json)
    
    write_sheet(INPUT_SHEET_NAME, data=res)

    result = read_sheet(OUTPUT_SHEET_NAME);

    resp ={
        'size':result[0][0],
        'price':result[0][1]
    }
    return jsonify(resp)

@app.route('/contact-us', methods=['POST'])
def contact_us():
    data = request.get_json() 
    return data



def create_ss_list(json:dict):
    l = [
        json['size'],
        json['cctv'],
        json['home server'],  
        'False',
        json['ac'],
        json['stove'],
        json['kettle'],
        json['microwave'],
        json['toaster'],
        json['oven'],
        json['geyser'],
        json['freezer'],
        json['heat pump'],
        json['borehole'],
        json['pool pump']
    ]
    return l
    
    
if __name__ == '__main__':
    app.run(host=CONSTANTS.HOST, debug=False)
    # app.run(host=CONSTANTS.HOST, debug=True)



