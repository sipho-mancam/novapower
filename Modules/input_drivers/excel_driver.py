import logging
import Modules.Processors.parser as parser
import pandas as pd
import os
import pathlib
import sys

"""
All Internal functions will be denoted by a trailing underscore before their name.
All those functions are never really called by the user, but internal by the program.


"""

logger = logging.getLogger('Console Logger')

logger.addHandler(logging.StreamHandler())

# itemName; PackageGroup; Brand; TypeGroup; sizeGroup; ItemPrice; Extras
def _read_excel(path:str, sheet_n:str)->pd.DataFrame: 
    """ 
    Args:
        path: string: -> relatvie path string.
        sheet_n: string -> sheet name as it appears on excel (exactly) 
    Reason:
        Abstracting the pd library for reading excel, to have more
        room to change the library later and not affect the rest of the program.
    Return:
        DataFrame from pandas 
    """
    df = None
    if os.path.isfile(path):
        df = pd.read_excel(path, sheet_name=sheet_n)
        df.fillna(0, inplace=True)
        return df
    else:
        p = pathlib.Path(path)
        if os.path.isfile(p):
            df = pd.read_excel(path, sheet_name=sheet_n)
            df.fillna(0, inplace=True)
            return df
        else:
            print("[x] File not found, please check the path and try again!")
            return None


def _clean_data(df:pd.DataFrame, key_id:str|float='ItemName')->None:
    """
    Args:
        df:Pandas DataFrame -> A pandas dataframe read from the
        key_id: str|float -> A key from the spreadsheet that you want to use as an
                            identifier for "valid" data 
    Reason: 
        Cleaning the DataFrame from any data that doesn't exist or has blank 
        spaces in the required field denoted by key_id
    Return:
        None
    """
    for i in range(len(df.index)):
        if df.loc[i,[key_id]][0] == 0:
            df.drop(
                labels=[i],
                axis=0,
                inplace=True)
    

def _parse_excel_to_dict(data_frame)->dict: # wrapper for the Parser(), but Parser() can be used alone without this wrapper. 
    parse = parser.Parser()
    return parse.parse_data_frame(data_frame)

def xl_to_json(xl_file, sheet)->dict: 
    """
    Args:
        xl_file: Path|str -> Path to an excel file, or a string with a relative pat
                            to the excel file.
        sheet: str-> Sheet name *exactly* as it appears in the spreadsheet, (case sensitive)
    Reason:
        This function abstracts the whole process of reading -> cleaning -> parsing xcel to json.
    Return:
        JSON -> Data in excel rows converted to json groups.
    """

    logger.info("[+] Reading Excel data")
    df = _read_excel(xl_file, sheet)
    logger.info("[+] Successfully Read excel ....")
    logger.info("[+] Cleaning data")
    _clean_data(df)
    logger.info('[+] Cleaning completed.')
    logger.info("[+] Parsing data to JSON")
    json = _parse_excel_to_dict(df)
    logger.info("[+] Successfully parsed data")
    return json
