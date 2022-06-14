from flask import Flask, make_response, request, jsonify, session
from flask_cors import CORS
from package_manager import *
import CONSTANTS
from packages import *
from init import *
import datetime
from sizing_tool import INPUT_SHEET_NAME, OUTPUT_SHEET_NAME, read_sheet, write_sheet

app = Flask(__name__)
app.secret_key = hashlib.sha256(randbytes(256), usedforsecurity=True).hexdigest()
CORS(app)


db_manager, client = setup()

data_path = './input-data-1.xlsx'

solar_package_handler = setup_input(data_path, 'Sheet1', keys=['solar', 'inverter', 'battery']);
inverter_package_handler = setup_input(data_path, 'Sheet1', keys=['inverter', 'battery'])
# generator_package_handler = setup_input(data_path,'Sheet1', keys=['generator'])


solar_package_handler.generate_package(10)
inverter_package_handler.generate_package(10)
# generator_package_handler.generate_package()

package_table = {
    # 'generator':generator_package_handler.get_summary(),
    'solar':solar_package_handler.get_summary(),
    'inverter':inverter_package_handler.get_summary()
}


@app.route('/packages/all', methods=['GET', 'OPTIONS']) # require a sesson token to send data
def index_data():
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
                
            }
        }

    return {'session_token':session_token}

def validate_cart_object(schema:dict, obj:dict):
    return True

@app.route('/add-to-cart', methods=['POST', 'PUT'])
def add_to_session_cart():
    session_token = request.args.get('session_token')
    data = request.get_json()
    if validate_cart_object(schema={}, data=data):
        if session_token in session:
            user_data = session[session_token]
            if 'cart' in user_data['data']:
                session[session_token]['data']['cart'].append(data)
                session.modified = True
            else:
                session[session_token]['data']['cart'] = []
                session[session_token]['data']['cart'].append(data)
                session.modified = True
            return {'response':0x01}
        else:
            return {'response':0x05}
    else:
        return {'response':0x06}


@app.route('/get-cart', methods=['GET'])
def get_cart_items():
    # get session token ...
    session_token = request.args.get('session_token')
    if session_token in session:
        try:
            cart = session[session_token]['data']['cart']
            return {'response':cart}
        except KeyError as ke:
            session[session_token]['data']['cart'] = []
            session.modified = True
            return {'response':0x11}
    else:
        return {'response':0x05}




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


def create_ss_list(json:dict):
    l = [
        json['size'],
        json['cctv'],
        json['home server'],
        'FALSE',
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
    app.run(host=CONSTANTS.HOST, debug=True)



