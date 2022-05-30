from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from package_manager import *
import CONSTANTS




app = Flask(__name__)
CORS(app)

p_manager, client = setup()

# p_manager.register_db(client[CONSTANTS.DB_ITEMS])

# serving index data  we have to server everything in the db


@app.route('/item/<collection_name>', methods=['GET', 'OPTIONS'])
def index_data(collection_name):
    counter = int(0)
    if collection_name in CONSTANTS.valid_collection_list:
        res = p_manager.read_all([CONSTANTS.DB_ITEMS], [collection_name])
        jres = {}
        for i in res[CONSTANTS.DB_ITEMS][collection_name]:
            item = i.to_dict() 
            item['index'] = counter
            jres['item '+str(counter)] = item
            counter += 1
        
        response = jsonify(jres)
        response.headers.add('Access-Control-Allow-Origin','*')
        return response
        # if jres is not None: return jres
        # else: return 'items not found'



if __name__ == '__main__':
    app.run(host=CONSTANTS.HOST,debug=True)



