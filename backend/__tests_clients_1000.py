import requests
import json
from datetime import datetime, timedelta
from faker import Faker
import random

# Define the base URL
base_url = 'http://127.0.0.1:8500'

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB5b3VzY2FsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJmdWxsbmFtZSI6IkFkbWluIFlvdXNjYWxlIiwicGFzc3dvcmQiOiIkMmIkMTAkM2h2RVVLLmZwOHMzVGtqaWdvejg1ZUhrVXdXRDBjdHU4b0FteVBKODFodHp3bkQ0RVdrTWUiLCJjcmVhdGVkQXQiOiIyMDIzLTA1LTI2VDEyOjAwOjE2LjAwMFoiLCJ1cGRhdGVkQXQiOiIyMDIzLTA1LTI2VDEyOjAwOjE2LjAwMFoiLCJpYXQiOjE2ODgxNjc4OTR9.oh6zCcyE3d-aGV5WFVDNMVLEmh-Dn4zIvOfDKjXZ8vI'

# Define the headers
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}',
    'User-Agent': 'PostmanRuntime/7.32.2',
    'Accept': '*/*',
    'Postman-Token': 'cba48f45-c0ed-4177-be8f-f5672d1dc624',
    'Host': 'api.oumardev.com',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
}


# Parcourir les dates du début à la fin
for _ in range(990):
    fake = Faker()

    payload = {
        "fullname": fake.name(),
        "telephone": fake.msisdn(),
        "email": fake.email(),
        "password": "password",
        "message": "velit autem nostrum"
    }
    
    print(payload)
    response = requests.post(f'{base_url}/api/youscale/v1/admin/client', headers=headers, json=payload)
        
    if response.status_code == 200:
        print('Insertion successful')
    else:
        print('Insertion failed')