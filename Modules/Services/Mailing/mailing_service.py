import os.path
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2 import service_account


SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def send_message(message):
    creds = None;
    data_res = []
    if os.path.exists('gmail-key.json'):
        creds = service_account.Credentials.from_service_account_file(
                                    'google-key.json', scopes=SCOPES)  
        print(creds)
        try:
            # Call the Gmail API
            service = build('gmail', 'v1', credentials=creds)
    
            results = service.users().labels().list(userId='107387578446738653520').execute()
            print(results)
            labels = results.get('labels', [])

            if not labels:
                print('No labels found.')
                return
            print('Labels:')
            for label in labels:
                print(label['name'])

        except HttpError as error:
            # TODO(developer) - Handle errors from gmail API.
            print(f'An error occurred: {error}')

send_message('hello')