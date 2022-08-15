

# import sys
# import pathlib

# sys.path.append(pathlib.Path(__file__+'/../Modules/').resolve().__str__())
# sys.path.append(pathlib.Path(__file__+'/../Modules/Services/Sizing_tool/src').resolve().__str__())


# import sizing_tool as st
import pickle

d ={'name':'sthembiso', 'data':dict}

print(dict)

with open('test.data', 'ab') as f:
    f.write(pickle.dumps(d))

with open('test.data', 'rb') as f:
    data = f.read()
    di = pickle.loads(data)

    print(di)