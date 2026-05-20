from web3 import Web3
import json
import os

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTRACT_PATH = os.path.join(BASE_DIR, "build", "contracts", "FoodTraceability.json")

with open(CONTRACT_PATH) as f:
    data = json.load(f)
    networks = data['networks']
    network_id = list(networks.keys())[-1] # Get latest
    address = networks[network_id]['address']
    abi = data['abi']

print(f"Checking address: {address} on network: {network_id}")
code = w3.eth.get_code(address)
print(f"Code at address (length): {len(code)}")

if len(code) > 2:
    contract = w3.eth.contract(address=address, abi=abi)
    try:
        records = contract.functions.getRecords().call()
        print(f"Success! Records: {records}")
    except Exception as e:
        print(f"Failed to call getRecords: {e}")
else:
    print("No contract code at this address!")
