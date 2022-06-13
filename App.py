from crypt import methods
from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from package_manager import *
import CONSTANTS
from packages import *
from init import *
import pprint
import json

from sizing_tool import INPUT_SHEET_NAME, OUTPUT_SHEET_NAME, read_sheet, write_sheet

app = Flask(__name__)
CORS(app)

db_manager, client = setup()

data_path = './input-data-1.xlsx'

solar_package_handler = setup_input(data_path, 'Sheet1', keys=['solar', 'inverter', 'battery', 'cable', 'rack']);
inverter_package_handler = setup_input(data_path, 'Sheet1', keys=['inverter', 'battery', 'cable'])
generator_package_handler = setup_input(data_path,'Sheet1', keys=['generator'])


solar_package_handler.generate_package()
inverter_package_handler.generate_package()
generator_package_handler.generate_package()

package_table = {
    'generator':generator_package_handler.get_summary(),
    'solar':solar_package_handler.get_summary(),
    'inverter':inverter_package_handler.get_summary()
}


@app.route('/packages/all', methods=['GET', 'OPTIONS'])
def index_data():
    return package_table


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



