from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")
GANACHE_RPC = os.getenv("GANACHE_RPC", "http://127.0.0.1:7545")

w3 = Web3(Web3.HTTPProvider(GANACHE_RPC))
if w3.is_connected():
    accounts = w3.eth.accounts
    print(f"ACCOUNTS: {','.join(accounts)}")
else:
    print("FAILED_TO_CONNECT")
