from flask import Flask, render_template, request, jsonify, send_from_directory, session, url_for
from flask_cors import CORS
from package_manager import *
import CONSTANTS
from packages_gen import *
from init import *
import datetime
from pdf_gen import generate_pdf
from utility import update_cart
from sizing_tool import INPUT_SHEET_NAME, OUTPUT_SHEET_NAME, read_sheet, write_sheet
import pathlib

app = Flask(__name__)
app.secret_key = hashlib.sha256(randbytes(256), usedforsecurity=True).hexdigest()
app.config['UPLOAD_FOLDER'] = pathlib.Path('./Quotes/').absolute().as_posix()
db_manager, client = setup()
data_path = './input-data-1.xlsx'
solar_package_handler = setup_input(data_path, 'Sheet1', keys=['solar', 'inverter', 'battery']);
inverter_package_handler = setup_input(data_path, 'Sheet1', keys=['inverter', 'battery'])

def validate_session(token):
    if token in session:
        return True
    return False

package_table = {
    # 'generator':generator_package_handler.get_summary(),
    'solar':solar_package_handler.get_summary(),
    'inverter':inverter_package_handler.get_summary()
}

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/store', methods=['GET'])
def store():
    return render_template('store.html')

@app.route('/cart', methods=['GET'])
def cart():
    return render_template('cart.html')

@app.route('/sizing', methods=['GET'])
def sizing():
    return render_template('sizing.html')

@app.route('/packages/all', methods=['GET', 'OPTIONS']) # require a sesson token to send data
def index_data():
    n = request.args.get('n')
    i = int(n)
    solar_package_handler.generate_package(i)
    inverter_package_handler.generate_package(i)
    # # generator_package_handler.generate_package()
    package_table = {
        'solar':solar_package_handler.get_summary(),
        'inverter':inverter_package_handler.get_summary()
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
                'cart':[]
            }
        }
        session.modified=True
    print(session)
    return {'session_token':session_token}

@app.route('/featured', methods=['GET'])
def get_featured_products():
    session_token = request.args.get('session_token')
    print(session)
    if validate_session(session_token):
        n = request.args.get('n')
        x = int(n)
        print(x)
        solar_package_handler.generate_package(x//2)
        inverter_package_handler.generate_package(x//2)
        return {
            'solar':solar_package_handler.get_summary(),
            'inverter':inverter_package_handler.get_summary()
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
        return {'response':0x01,}
    else:
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
            



@app.route('/contact-us', methods=['POST'])
def contact_us():
    data = request.get_json() 
    print(data)

    return data

@app.route('/update-cart', methods=['POST'])
def update_cart_items():
    session_token = request.args.get('session_token')
    data = request.get_json()
    print(data)
    func = request.args.get('func')
    if session_token in session:
        user_data = session[session_token]['data']
        res = update_cart(data['_uid'], user_data['cart'], func)
        if res:
            session.modified = True
            return {func:'Sucessful'};
        else: return {func:'Failed'}
    return {'response':0x05}


@app.route('/get-quote', methods=['GET', 'POST'])
def get_quote():
    if request.method == 'POST':
        session_token = request.args.get('session_token')
        user_info = request.get_json()
        if session_token in session:
            data = session[session_token]['data']
            p = generate_pdf(user_info['name']+'.pdf', data['cart'], user_info)
            print(app.config['UPLOAD_FOLDER'])
            data['quote'] = p.name
            session.modified = True
        return {'filename':p.name}
    elif request.method == 'GET':
        session_token = request.args.get('session_token')
        if session_token in session:
            return send_from_directory(app.config['UPLOAD_FOLDER'], session[session_token]['data']['quote']) 


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
    # app.run(host=CONSTANTS.HOST, debug=True)



