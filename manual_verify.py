from web3 import Web3
import os

w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))
if w3.is_connected():
    print("Connected!")
else:
    print("Failed")
    exit(1)

# Manually typed address from truffle output
addr = '0x7dD5A23E09cE9019762835F1999d25226Ae78dAB3'
checksum_addr = Web3.to_checksum_address(addr)
print(f"Checksum Addr: {checksum_addr}")

# ABI from FoodTraceability.json
import json
with open('build/contracts/FoodTraceability.json') as f:
    abi = json.load(f)['abi']

contract = w3.eth.contract(address=checksum_addr, abi=abi)
print("Contract initialised")

try:
    records = contract.functions.getRecords().call()
    print(f"Retrieved {len(records)} records")
except Exception as e:
    print(f"Error: {e}")
