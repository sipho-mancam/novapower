from mongo_broker import *


client = connect(HOST, PORT)

if client is not None:
    db = client['test']
    collection = db['test-collection']

    print(collection.name)

    res = insert_records(db, collection.name, [{
        "name": "Sthembiso",
        "last-name":"Mancam"
    },
    {
        "name": "Sthembiso",
        "last-name":"Mancam2"
    }])

    res2 = read_records(db, collection.name)

    for _ in res2:
        print(_)
    # print(res2)