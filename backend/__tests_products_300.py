import requests
import json
from datetime import datetime, timedelta
from faker import Faker
import random

# Define the base URL
base_url = 'http://127.0.0.1:8500'

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsInJlZmVyZW5jZSI6IjRiN2FjOWQyLTY5MTItNGI4OS1hZjM3LWZlNWY5OTIwMDk4NCIsImZ1bGxuYW1lIjoiSEFKQVIgQkVMS0hESU0iLCJtZXNzYWdlIjpudWxsLCJyb2xlIjoiY2xpZW50IiwiZW1haWwiOiJCZWxraGRpbS5oYWphcjFAZ21haWwuY29tIiwiYWN0aXZlIjp0cnVlLCJmYXZvcml0ZSI6ZmFsc2UsImlzVHJpYWwiOnRydWUsInRlbGVwaG9uZSI6IisyMTI2MzEyNTIyODIiLCJwYXNzd29yZCI6IiQyYiQxMCREYjM0SEhUNkNGZXVHNU4zbHpxdDNlOE5TdE9LenIxWDRjWkhKQkJ4b0gzY0R4Rk5SbWxMbSIsImxpdm9Ub2tlbiI6IkFQZ2RuZ3dtZnVoandyenBqdWFxdnhncmdwa3Bxa2VqenNpb2RyZndra2kzMzYyMTQwNDQxMTQxMzYyNDE1MjI1ODk5NDEwOTQ4MTQzNTUyMDkzNCIsImlkX2FkbWluIjoxLCJpZF9hZG1pbl9zZXR0aW5nIjo2LCJpZF90ZWFtX21lbWJlcl9jb25maXJtYXRpb24iOm51bGwsImNyZWF0ZWRBdCI6IjIwMjMtMDctMTBUMjA6MzM6MDUuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjMtMDctMTFUMTE6NDY6MDYuMDAwWiIsImlhdCI6MTY4OTU4ODM4NX0.mw3JEphCdhnF1bjJjzM94m4K_48JT7pdvzSO4CJ7RtU'

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
for _ in range(297):
    fake = Faker()

    payload = {
        "name": fake.last_name_female(),
        "price_selling": "455",
        "variant": []
    }
    
    print(payload)
    response = requests.post(f'{base_url}/api/youscale/v1/client/product', headers=headers, json=payload)
        
    if response.status_code == 200:
        print('Insertion successful')
    else:
        print('Insertion failed')