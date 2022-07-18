import os.path

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2 import service_account


SPREADSHEET_ID = '1jvGPuUePZVLy2ZhVw4XLn9-sREGccnN5g1DpHsYrST0'
INPUT_SHEET_NAME = 'Data In!A2:2'
OUTPUT_SHEET_NAME='Data Out!A2:B2'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


def read_sheet(in_sheet)->list:
    creds = None;
    data_res = []
    if os.path.exists('google-key.json'):
        creds = service_account.Credentials.from_service_account_file(
                                    'google-key.json', scopes=SCOPES)  
        try:
            service = build('sheets', 'v4', credentials=creds)

            req = service.spreadsheets().values().get(
                                            spreadsheetId=SPREADSHEET_ID, 
                                            range=in_sheet)
            res = req.execute()

            
            values = res.values()

            if not values:
                print('No data found')

            for row in values:
                if type(row) is list:
                    data_res = row
        except HttpError as err:
            print(err)
        
        finally:
            return data_res
    else:
        print('[x] Key file not found!')

def generate_request_body(sheet_name, data):
    return{
        "range":sheet_name,
        "majorDimension":"ROWS",
        "values":[data]
    }


def write_sheet(sheet_name, data):
    creds = None;
    body = generate_request_body(sheet_name, data)
    if os.path.exists('google-key.json'):
        creds = service_account.Credentials.from_service_account_file(
                                    'google-key.json', scopes=SCOPES)  
        try:
            service = build('sheets', 'v4', credentials=creds)

            req = service.spreadsheets().values().update(
                spreadsheetId=SPREADSHEET_ID, 
                valueInputOption='USER_ENTERED', 
                range=sheet_name, body=body)
            
            res = req.execute()
            return res

        except HttpError as err:
            print(err)
    else:
        print('[x] Key file not found!')




