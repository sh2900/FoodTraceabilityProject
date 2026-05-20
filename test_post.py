import requests
url = "http://localhost:5000/simulate"
data = {"temperature": 18, "location": "Final Test", "status": "Success Verify"}
try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
