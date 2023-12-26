import requests
import json

# Define the base URL
base_url = 'http://api.oumardev.com'

# Define the headers
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicmVmZXJlbmNlIjoiZDAwZmQ2NTktM2I3NS00M2UzLWE3ZDQtMDhjY2U4MzRhZjRmIiwiZnVsbG5hbWUiOiJNb2hhbWVkIGRpb3AiLCJyb2xlIjoiY2xpZW50IiwiZW1haWwiOiJtb2hhbWVkQG1haWwuY29tIiwiYWN0aXZlIjp0cnVlLCJ0ZWxlcGhvbmUiOiIrMjIxNzc4MTQzNjEwIiwicGFzc3dvcmQiOiIkMmIkMTAkMTBSRHY3QmpCWXQwdzZ2bVlKQXlELnVFdTJ2RzVkbXZyWTB2dWZKUDd0OUhQMFhCQktJenEiLCJpZF9hZG1pbiI6MSwiaWRfdGVhbV9tZW1iZXJfc3VwcG9ydCI6bnVsbCwiaWRfdGVhbV9tZW1iZXJfY29uZmlybWF0aW9uIjpudWxsLCJpZF90ZWFtX21lbWJlcl9jb21tZXJjaWFsIjpudWxsLCJjcmVhdGVkQXQiOiIyMDIzLTA0LTIyVDE1OjQ2OjA3LjAwMFoiLCJ1cGRhdGVkQXQiOiIyMDIzLTA1LTA1VDA2OjM0OjI1LjAwMFoiLCJpYXQiOjE2ODM2NDU5Mzl9.poZbxmidAUVo9WErFrb_Kk5u-hbM3GvXPKTi_DA-bUk',
    'User-Agent': 'PostmanRuntime/7.32.2',
    'Accept': '*/*',
    'Postman-Token': 'cba48f45-c0ed-4177-be8f-f5672d1dc624',
    'Host': 'api.oumardev.com',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
}

# Define the JSON payload
payload = {
    "nom": "Test",
    "telephone": "078955565",
    "prix": "2015",
    "adresse": "Place1",
    "message": "",
    "id_city": "1",
    "status": "Livre",
    "source": "none",
    "updownsell": "none",
    "changer": "none",
    "ouvrir": "none",
    "id_product_array": [{
        "id": "11",
        "quantity": 3,
        "variant": []
    }]
}


nb_orders=20000
for _ in range(nb_orders):
    response = requests.post(f'{base_url}/api/youscale/v1/client/order', headers=headers, json=payload)

    if response.status_code == 200:
        print('Insertion successful ', _)
    else:
        print('Insertion failed ',_)