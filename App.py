from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from package_manager import *
import CONSTANTS
from packages import *
from init import *
import pprint

app = Flask(__name__)
CORS(app)

db_manager, client = setup()

solar_package_handler = setup_input('./input-data.xlsx', 'Sheet1', keys=['solar', 'inverter', 'battery', 'cable', 'rack']);
inverter_package_handler = setup_input('./input-data.xlsx', 'Sheet1', keys=['inverter', 'battery', 'cable', 'rack'])
generator_package_handler = setup_input('./input-data.xlsx','Sheet1', keys=['generator'])


solar_package_handler.generate_package(10)
inverter_package_handler.generate_package(10)
generator_package_handler.generate_package(3)

package_table = {
    'generator':generator_package_handler.get_summary(),
    'solar':solar_package_handler.get_summary(),
    'inverter':inverter_package_handler.get_summary()
}


@app.route('/packages/all', methods=['GET', 'OPTIONS'])
def index_data():
    return package_table

@app.route('/')
def index():
    return "Hello world"

if __name__ == '__main__':
    app.run(host=CONSTANTS.HOST, debug=True)



