from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join("backend", ".env"))

GANACHE_RPC = os.getenv("GANACHE_RPC", "http://127.0.0.1:7545")
CONTRACT_ADDR = os.getenv("CONTRACT_ADDR")

w3 = Web3(Web3.HTTPProvider(GANACHE_RPC))

print(f"Connecting to {GANACHE_RPC}...")
if w3.is_connected():
    print("Connected to Ganache!")
else:
    print("Failed to connect to Ganache.")
    exit(1)

print(f"Contract address: {CONTRACT_ADDR}")
if not CONTRACT_ADDR:
    print("CONTRACT_ADDR not set in .env")
    exit(1)

# Check if contract has code at this address
code = w3.eth.get_code(CONTRACT_ADDR)
if code == b'\x00' or code == b'':
    print(f"No contract found at address {CONTRACT_ADDR}")
else:
    print(f"Contract found at address {CONTRACT_ADDR}")

# Check ABI
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTRACT_PATH = os.path.join(BASE_DIR, "build", "contracts", "FoodTraceability.json")
if os.path.exists(CONTRACT_PATH):
    with open(CONTRACT_PATH) as f:
        c_json = json.load(f)
        abi = c_json['abi']
        contract = w3.eth.contract(address=CONTRACT_ADDR, abi=abi)
        try:
            records = contract.functions.getRecords().call()
            print(f"Successfully called getRecords: Found {len(records)} records.")
        except Exception as e:
            print(f"Error calling getRecords: {str(e)}")
else:
    print(f"Artifact not found at {CONTRACT_PATH}")
