from web3 import Web3
import json
import os

# Connect to Ganache
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

# Load ABI
CONTRACT_PATH = r"c:\Users\Dell\OneDrive\Desktop\FoodTraceabilityProject\build\contracts\FoodTraceability.json"
with open(CONTRACT_PATH) as f:
    contract_json = json.load(f)
    contract_abi = contract_json['abi']
    contract_address = contract_json['networks']['5777']['address']

# Connect contract
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

try:
    print(f"Contract address: {contract_address}")
    records = contract.functions.getRecords().call()
    print(f"Records found: {len(records)}")
    for r in records:
        print(r)
except Exception as e:
    print(f"Error calling getRecords: {e}")
