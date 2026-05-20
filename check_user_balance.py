from web3 import Web3
import os

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

# The address provided by the user
user_addr = "0x4FAa5C0906fAf8E5c155e7cC5eAfA1d7b8af06b9"

print(f"Connected: {w3.is_connected()}")
if w3.is_connected():
    balance_wei = w3.eth.get_balance(user_addr)
    balance_eth = w3.from_wei(balance_wei, 'ether')
    print(f"User Address Balance: {balance_eth} ETH")
    
    accounts = w3.eth.accounts
    print(f"Found {len(accounts)} accounts in Ganache")
    if accounts:
        first_acc = accounts[0]
        first_bal = w3.from_wei(w3.eth.get_balance(first_acc), 'ether')
        print(f"First Ganache Account ({first_acc}): {first_bal} ETH")
