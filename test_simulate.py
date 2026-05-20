import requests
payload = {"temperature": 5, "location": "Testing", "status": "Verifying"}
response = requests.post("http://localhost:5000/simulate", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
