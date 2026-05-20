from web3 import Web3
import os
import json
from dotenv import load_dotenv

# Load the updated .env
load_dotenv(r"C:\Users\Dell\OneDrive\Desktop\FoodTraceabilityProject\backend\.env")

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
account = os.getenv("ACCOUNT_ADDR")
private_key = os.getenv("PRIVATE_KEY")
contract_addr = os.getenv("CONTRACT_ADDR")

print(f"Account: {account}")
print(f"Contract: {contract_addr}")

# Load ABI
with open(r"C:\Users\Dell\OneDrive\Desktop\FoodTraceabilityProject\build\contracts\FoodTraceability.json") as f:
    abi = json.load(f)['abi']

contract = w3.eth.contract(address=contract_addr, abi=abi)

def test_add_record():
    print("\nAttempting to add a test record...")
    nonce = w3.eth.get_transaction_count(account)
    tx = contract.functions.addRecord(
        25, "Test Location", "2026-04-02 12:00:00", "Testing"
    ).build_transaction({
        'from': account,
        'nonce': nonce,
        'gas': 1000000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    raw = getattr(signed_tx, 'raw_transaction', getattr(signed_tx, 'rawTransaction', None))
    tx_hash = w3.eth.send_raw_transaction(raw)
    print(f"Transaction sent! Hash: {Web3.to_hex(tx_hash)}")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Transaction mined in block {receipt.blockNumber}")
    
    records = contract.functions.getRecords().call()
    print(f"Current records count: {len(records)}")
    if len(records) > 0:
        print(f"Latest record: {records[-1]}")

if __name__ == "__main__":
    if w3.is_connected():
        test_add_record()
    else:
        print("Failed to connect to Ganache")
