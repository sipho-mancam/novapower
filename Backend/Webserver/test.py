from package_manager import *
from mongo_broker import *

client = connect(HOST, PORT)

if client is not None:
    pm = PManager(client, client['test-db'], client['test-db']['test-collection'].name, {})

    res = pm._insert_record(record={
        "name":"Sthembiso Musana",
        "last name":"Sipho Mancam"
    })

    print(res)
