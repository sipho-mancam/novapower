from parser import Parser
from utility import *
import pandas as pd
import os
import pathlib

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

def parse_excel_to_dict(data_frame):
    clean_data(data_frame)
    parser = Parser()
    return parser.parse_data_frame(data_frame)

def xl_to_json(xl_file, sheet):
    df = read_excel(xl_file, sheet)
    js = parse_excel_to_dict(df)
    write_json('data-1.json', js)
    return js
