from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv(r"C:\Users\Dell\OneDrive\Desktop\FoodTraceabilityProject\backend\.env")

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

env_addr = os.getenv("ACCOUNT_ADDR")
user_addr = "0x4FAa5C0906fAf8E5c155e7cC5eAfA1d7b8af06b9"

def check_balance(addr, label):
    if not addr:
        print(f"{label}: Address is None")
        return
    try:
        balance_wei = w3.eth.get_balance(addr)
        balance_eth = w3.from_wei(balance_wei, 'ether')
        print(f"{label} ({addr}): {balance_eth} ETH")
    except Exception as e:
        print(f"{label} ({addr}): Error - {e}")

print(f"Connected: {w3.is_connected()}")
check_balance(env_addr, "Address in .env")
check_balance(user_addr, "Address from User")

try:
    accounts = w3.eth.accounts
    print("\nGanache Accounts With Funds:")
    for acc in accounts:
        bal = w3.eth.get_balance(acc)
        if bal > 0:
            print(f"{acc}: {w3.from_wei(bal, 'ether')} ETH")
except Exception as e:
    print(f"Error: {e}")
