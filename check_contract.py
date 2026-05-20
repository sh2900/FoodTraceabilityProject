from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv(r"C:\Users\Dell\OneDrive\Desktop\FoodTraceabilityProject\backend\.env")

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
contract_addr = os.getenv("CONTRACT_ADDR")

print(f"Checking contract at: {contract_addr}")
if contract_addr:
    code = w3.eth.get_code(contract_addr)
    # Print the first 10 characters of the hexadecimal representation of the code,
    # and use a ternary-like conditional to print the length or "No code" if the code is empty.
    print(f"Code found (length {len(code)}): {code.hex()[:10]}..." if code else "No code found at this address.")
else:
    print("No contract address provided.")
