from __future__ import print_function
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


SPREADSHEET_ID = '1jvGPuUePZVLy2ZhVw4XLn9-sREGccnN5g1DpHsYrST0'
INPUT_SHEET_NAME = 'Data In!2:1'
OUTPUT_SHEET_NAME='Data Out!A2:B2'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def main():

    creds = None;

    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds._refresh_token:
            creds.refresh(Request())
        else:
            print(os.path.exists('google-key.json'))
            flow = InstalledAppFlow.from_client_secrets_file(
                            'google-key.json',
                             SCOPES)
            creds = flow.run_local_server(port=0)

            with open('token.json', 'w') as token:
                token.write(creds.to_json())
            
        try:
            service = build('sheets', 'v4', credentials=creds)

            sheet = service.spreadSheets()

            result = sheet.values().get(spreadsheetId=SPREADSHEET_ID,
                                        range=INPUT_SHEET_NAME)
            
            values = result.get('values', [])

            if not values:
                print('No data found')
                return

            print('Data from spreadsheet')
            for row in values:
                print('{} {}'.format(row[0], row[1]))
        except HttpError as err:
            print(err)

if __name__ == '__main__':
    main()
