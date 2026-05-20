from web3 import Web3

def check():
    w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))
    if not w3.is_connected():
        print("Could not connect to Ganache")
        return

    accounts = w3.eth.accounts
    print("Ganache Accounts:")
    for i, acc in enumerate(accounts):
        balance = w3.from_wei(w3.eth.get_balance(acc), 'ether')
        print(f"{i}: {acc} ({balance} ETH)")

if __name__ == "__main__":
    check()
