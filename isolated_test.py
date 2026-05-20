from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join('backend', '.env'))

RPC = os.getenv("GANACHE_RPC", "http://127.0.0.1:7545")
ACC = os.getenv("ACCOUNT_ADDR")
KEY = os.getenv("PRIVATE_KEY")
ADR = os.getenv("CONTRACT_ADDR")

w3 = Web3(Web3.HTTPProvider(RPC))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTRACT_PATH = os.path.join(BASE_DIR, "build", "contracts", "FoodTraceability.json")

with open(CONTRACT_PATH) as f:
    abi = json.load(f)['abi']

contract = w3.eth.contract(address=Web3.to_checksum_address(ADR), abi=abi)

print(f"Testing addRecord from {ACC} to {ADR}")
try:
    nonce = w3.eth.get_transaction_count(Web3.to_checksum_address(ACC))
    func = contract.functions.addRecord(25, "Test Loc", "2026-04-01 12:00:00", "Testing")
    
    print("Estimating gas...")
    gas = func.estimate_gas({'from': Web3.to_checksum_address(ACC)})
    print(f"Gas estimate: {gas}")
    
    tx = func.build_transaction({
        'from': Web3.to_checksum_address(ACC),
        'nonce': nonce,
        'gas': int(gas * 1.5),
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed = w3.eth.account.sign_transaction(tx, private_key=KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction if hasattr(signed, 'raw_transaction') else signed.rawTransaction)
    print(f"Success! Hash: {tx_hash.hex()}")
except Exception as e:
    import traceback
    print("FAILED with exception:")
    print(traceback.format_exc())
