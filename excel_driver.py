from parser import Parser
from utility import *
import pandas as pd
import os
import pathlib
import pprint


# itemName; PackageGroup; Brand; TypeGroup; sizeGroup; ItemPrice; Extras

def read_excel(path, sheet_n):
    df = None

    if os.path.isfile(path):
        excel_file = pd.ExcelFile(path)
        df = pd.read_excel(path, sheet_name=sheet_n)
        df.fillna(0, inplace=True)
        return df
    else:
        p = pathlib.Path(path)
        if os.path.isfile(p):
            excel_file = pd.ExcelFile(path)
            df = pd.read_excel(path, sheet_name=sheet_n)
            df.fillna(0, inplace=True)
            return df
        else:
            print("[x] File not found, please check the path and try again!")
            return None

def clean_data(df):
    for i in range(len(df.index)):
        if df.loc[i,['ItemName']][0] == 0:
            df.drop(
                labels=[i],
                axis=0,
                inplace=True
            )

def parse_size(size:str)->dict:
    res = dict()
    # name-unit:value, ...
    s = size.split(',') # seperate the different sizes ...
    for _s in s:
        try:
            _r = _s.split(':')
            value = _r[1]
            _r2 = _r[0].split('-')
            name = _r2[0]
            unit = _r2[1]
            res[name]={'value':float(value), 'unit':unit};
        except Exception as e:
            pass
    return res


def parse_excel_to_dict(data_frame):

    clean_data(data_frame)
    parse = Parser()
    return parse.parse_data_frame(data_frame)
    # items_collection ={
    #     'solar':[], 
    #     'inverter':[], 
    #     'battery':[], 
    #     'controller':[],
    #     'rack':[],
    #     'labour':[], 
    #     'cable':[], 
    #     'generator':[],
    #     'default':[]
    # }
    # s = ''

    # length = len(data_frame.index)
    # for i in range(length):
    #     j_data = {}
    #     # j_data = {}
    #     item = data_frame.loc[i]
    #     j_data['name'] = item[0]
    #     j_data['pacakge-group'] = item[1]
    #     j_data['brand'] = item[2]
    #     j_data['type'] = item[3]
    #     j_data['size'] = parse_size(item[4])
    #     j_data['price'] = float(item[5])
    #     j_data['extras'] = item[6]

    #     if j_data['name'].lower().lstrip().rstrip('s') in items_collection:
    #         # print(j_data[key]['name'].lower().lstrip())
    #         items_collection[j_data['name'].lower().lstrip()].append(j_data)

    # return items_collection



def xl_to_json(xl_file, sheet):
    df = read_excel(xl_file, sheet)
    js = parse_excel_to_dict(df)

    # pprint.pprint(js)
    # pprint.pprint(df)
    # print(df.columns)
    write_json('data-1.json', js)

    return js





# print(js)