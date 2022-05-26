import random
from flask import Flask, request, jsonify

from item import Item
from random import choice

app = Flask(__name__)



################
# testing code #
################

# items = dict()
# l_i = [
#     'Solar',
#     'Inverter',
#     'Battery',
#     'Charger'
# ]

# for _ in range(10):
#     t = Item("231fasd12{}".format(_), choice(l_i), _*random.random(), "Some item", "/imagesdata")
#     items['item - {}'.format(_)] = t.to_dict()
    

# end of test code 

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
                "cclass":cl}
    else:
        return "Request not found"




if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
    # pass

