<<<<<<< HEAD
import random
from flask import Flask, request, jsonify
from item import Item
from random import choice

app = Flask(__name__)

def init():
    global app


@app.route('/') # give me everything you have in the database...
def view_function():
    # request some data from the db
    items = dict()
    l_i = [
        'Solar',
        'Inverter',
        'Battery',
        'Charger'
    ]

    for _ in range(10):
        t = Item("231fasd12{}".format(_), choice(l_i), _*random.random(), "Some item", "/imagesdata")
        items['item - {}'.format(_)] = t.to_dict()

    return items


@app.route('/on-one', methods=['GET', 'POST', 'DELETE', 'PUT'])
def on_one():
    #get the id argument to search the db with ..
    if request.method== 'GET':
        id = request.args.get('id') # get the object id to query with
        cl = request.args.get('cl') # get the class under which the object belongs...
        print(id)
        app.logger.info('id') 
        return {"response":id,
                "class":cl}
    else:
        return "Request not found"






def get_app_instance():
    global app
    return app

=======
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
    print(collection_name)
    if collection_name in CONSTANTS.valid_collection_list:
        res = p_manager.read_all([CONSTANTS.DB_ITEMS], [collection_name])
        jres = {}
        for i in res[CONSTANTS.DB_ITEMS][collection_name]:
            item = i.to_dict() 
            item['index'] = counter
            jres['item '+str(counter)] = item
            counter += 1
     
        # return 
        if jres is not None: return jres
        else: return 'items not found'
    return 'collection is not in the list'



if __name__ == '__main__':
    app.run(host=CONSTANTS.HOST,debug=True)



>>>>>>> 12f57be8798c80551edcbdd0a54d056fc783f192
