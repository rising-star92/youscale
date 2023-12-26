import requests
import json
from datetime import datetime, timedelta
import random

# Define the base URL
base_url = 'http://127.0.0.1:8500'

# Define the headers
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwicmVmZXJlbmNlIjoiY2ZjM2Y1NGYtNjI5Zi00YjhlLTkxMzYtMDU5N2NkM2Y1MWY3IiwiZnVsbG5hbWUiOiJtb2hhbWVkMTAwIiwicm9sZSI6ImNsaWVudCIsImVtYWlsIjoibW9oYW1lZDEwMEBnbWFpbC5jb20iLCJhY3RpdmUiOnRydWUsImlzVHJpYWwiOnRydWUsInRlbGVwaG9uZSI6IisyMTI2ODk2NDg3MTIiLCJwYXNzd29yZCI6IiQyYiQxMCRPQVBwc3VSVUd6Z3NvTG5samQ4MS4udDBPejltSjdqYkZRL2FFYVZXZ09YUE9HbkZJSTJEbSIsImxpdm9Ub2tlbiI6bnVsbCwiaWRfYWRtaW4iOjEsImlkX2FkbWluX3NldHRpbmciOjEsImlkX3RlYW1fbWVtYmVyX3N1cHBvcnQiOm51bGwsImlkX3RlYW1fbWVtYmVyX2NvbmZpcm1hdGlvbiI6bnVsbCwiaWRfdGVhbV9tZW1iZXJfY29tbWVyY2lhbCI6bnVsbCwiY3JlYXRlZEF0IjoiMjAyMy0wNi0xMFQyMDozMzowNy4wMDBaIiwidXBkYXRlZEF0IjoiMjAyMy0wNi0xMFQyMDozMzoxMi4wMDBaIiwiaWF0IjoxNjg2NDI5MzI3fQ.ZhIPqZySxOHtHUdVwSBW2hmkgcAhc7miICMgfMWyhiU',
    'User-Agent': 'PostmanRuntime/7.32.2',
    'Accept': '*/*',
    'Postman-Token': 'cba48f45-c0ed-4177-be8f-f5672d1dc624',
    'Host': 'api.oumardev.com',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
}

def get_random_status():
    status =['Livre', 'Nouveau', 'Refuse']
    return random.choice(status)

# Define the JSON payload
payload = {
    "nom": "Test",
    "telephone": "078955565",
    "prix": "250",
    "adresse": "Place1",
    "message": "",
    "id_city": "3",
    "source": "none",
    "updownsell": "none",
    "changer": "none",
    "ouvrir": "none",
    "id_product_array": [
    {
        "id": "8",
        "quantity": 1,
        "variant": []
    },
    {
        "id": "9",
        "quantity": 1,
        "variant": []
    }
    ]
}

# Définir la date de début et de fin
start_date = datetime(2023, 6, 5)
end_date = datetime(2023, 6, 10)

# Parcourir les dates du début à la fin
current_date = start_date
while current_date <= end_date:
    # Déterminer le nombre de commandes à ajouter pour cette date
    day_orders = 2 * (current_date - start_date).days + 10
    
    # Ajouter les commandes pour cette date
    for _ in range(day_orders):
        payload['date'] = current_date.strftime('%Y-%m-%d')
        payload['status'] = get_random_status()

        response = requests.post(f'{base_url}/api/youscale/v1/client/order', headers=headers, json=payload)
        
        if response.status_code == 200:
            print('Insertion successful')
        else:
            print('Insertion failed')
    
    # Passer à la date suivante
    current_date += timedelta(days=1)
