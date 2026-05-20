import os
from web3 import Web3
import json
from dotenv import load_dotenv
import traceback

load_dotenv(dotenv_path="backend/.env")

GANACHE_RPC = os.getenv("GANACHE_RPC", "http://127.0.0.1:7545")
CONTRACT_ADDR = os.getenv("CONTRACT_ADDR", "").strip()
print(f"RAW_CONTRACT_ADDR: '{CONTRACT_ADDR}' (Length: {len(CONTRACT_ADDR)})")

print(f"Connecting to {GANACHE_RPC}...")
w3 = Web3(Web3.HTTPProvider(GANACHE_RPC))

if not w3.is_connected():
    print("Failed to connect to Ganache")
    exit(1)

print("Connected!")

CONTRACT_PATH = "build/contracts/FoodTraceability.json"
if not os.path.exists(CONTRACT_PATH):
    print(f"Contract artifact not found at {CONTRACT_PATH}")
    exit(1)

with open(CONTRACT_PATH) as f:
    c_json = json.load(f)
    abi = c_json['abi']

if not CONTRACT_ADDR:
    print("CONTRACT_ADDR not found in .env")
    exit(1)

print(f"Initializing contract at {CONTRACT_ADDR}...")
contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDR), abi=abi)

try:
    print("Calling getRecords()...")
    records = contract.functions.getRecords().call()
    print(f"Retrieved {len(records)} records")
    for r in records:
        print(r)
except ValueError as ve:
    print(f"ValueError: {ve}")
except Exception as e:
    print("Error calling getRecords:")
    print(traceback.format_exc())
