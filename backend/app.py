import os
import time
import random
import json
import traceback
from flask import Flask, jsonify, request
from flask_cors import CORS
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# --- 🛰️ LOGGING UTILITY (Emoji-free for Windows compatibility) ---
def log_backend(tag, msg, data=None):
    timestamp = time.strftime("%H:%M:%S")
    prefix = f"[{timestamp}] [BACKEND] {tag}:"
    if data:
        print(f"{prefix} {msg} | DATA: {data}")
    else:
        print(f"{prefix} {msg}")

# --- 🌐 ENHANCED CORS SETUP ---
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# --- 🏗️ BLOCKCHAIN CONFIGURATION ---
GANACHE_RPC = os.getenv("GANACHE_RPC", "http://127.0.0.1:7545")
ACCOUNT_ADDR = os.getenv("ACCOUNT_ADDR", "").strip()
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "").strip()
CONTRACT_ADDR = os.getenv("CONTRACT_ADDR", "").strip()

def connect_to_blockchain():
    hosts = [GANACHE_RPC, "http://localhost:7545", "http://127.0.0.1:7545"]
    for host in hosts:
        try:
            w3 = Web3(Web3.HTTPProvider(host))
            if w3.is_connected():
                log_backend("NETWORK", f"Connected to Ganache at {host}")
                return w3
        except Exception as e:
            log_backend("NETWORK_FAIL", f"Failed for {host}: {str(e)}")
    return None

w3 = connect_to_blockchain()

# --- 📄 CONTRACT CONNECTION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTRACT_PATH = os.path.join(BASE_DIR, "..", "build", "contracts", "FoodTraceability.json")

def get_contract():
    if not w3:
        log_backend("CONTRACT_ABORT", "Web3 not connected.")
        return None
    try:
        address = CONTRACT_ADDR
        if address:
            log_backend("CONFIG", "Found CONTRACT_ADDR in .env", address)
        elif os.path.exists(CONTRACT_PATH):
            with open(CONTRACT_PATH) as f:
                c_json = json.load(f)
                nets = c_json.get('networks', {})
                net_id = list(nets.keys())[-1] if nets else None
                address = nets.get(net_id, {}).get('address') if net_id else None
                log_backend("CONFIG", "Fallback: Artifact address found", address)
        
        if not address:
            log_backend("CRITICAL", "Could not locate contract address.")
            return None
            
        with open(CONTRACT_PATH) as f:
            c_json = json.load(f)
            abi = c_json['abi']
            checksum_addr = Web3.to_checksum_address(address)
            log_backend("CONTRACT_INIT", "Initialized contract at", checksum_addr)
            return w3.eth.contract(address=checksum_addr, abi=abi)
    except Exception as e:
        log_backend("CONTRACT_ERROR", "Initialization failure", traceback.format_exc())
        return None

contract = get_contract()

def store_on_blockchain(temp, location, timestamp, status):
    log_backend("TX_START", f"Storing Data: {temp}C, {location}")
    if not w3 or not contract or not PRIVATE_KEY:
        log_backend("TX_ABORT", "Connectivity or credential failure.")
        return "ERROR_CONFIG: Backend missing credentials (check .env)"
    
    try:
        ch_acc = Web3.to_checksum_address(ACCOUNT_ADDR)
        nonce = w3.eth.get_transaction_count(ch_acc)
        log_backend("NONCE", nonce)
        
        func = contract.functions.addRecord(int(temp), location, timestamp, status)
        
        # Build transaction with FIXED safe gas limit
        tx = func.build_transaction({
            'from': ch_acc,
            'nonce': nonce,
            'gas': 1000000,
            'gasPrice': w3.to_wei('20', 'gwei')
        })

        log_backend("SIGNING", "Signing transaction with private key...")
        signed = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        
        raw = getattr(signed, 'raw_transaction', getattr(signed, 'rawTransaction', None))
        if not raw:
            raise AttributeError("Raw transaction data missing from signed object.")
            
        tx_hash = w3.eth.send_raw_transaction(raw)
        hash_hex = Web3.to_hex(tx_hash)
        log_backend("TX_COMPLETE", "Successfully recorded hash", hash_hex)
        return hash_hex
        
    except Exception as e:
        full_err = traceback.format_exc()
        log_backend("TX_ERROR", "Transaction failed", full_err)
        return f"ERROR_TRACEBACK: {full_err}"

# --- 🚀 API ROUTES ---

@app.route("/data", methods=["GET"])
def get_sensor_data():
    log_backend("API_CALL", "GET /data")
    temp = round(random.uniform(2, 12), 2)
    humidity = round(random.uniform(60, 90), 2)
    location = "Warehouse-A"
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

    st_msg = "Safe"
    if temp > 8 or humidity > 85: st_msg = "Moderate Risk"
    if temp > 10 and humidity > 80: st_msg = "High Risk"

    data = {
        "temperature": temp, "humidity": humidity, "location": location,
        "timestamp": timestamp, "status": st_msg
    }

    if "Risk" in st_msg:
        log_backend("LEDGER_TRIGGER", "Auto-recording risk data.")
        store_on_blockchain(temp, location, timestamp, st_msg)

    return jsonify(data)

@app.route("/real-blockchain", methods=["GET"])
def get_blockchain_records():
    log_backend("API_CALL", "GET /real-blockchain")
    if not contract:
        return jsonify({"error": "Contract connection failed"}), 500
    
    try:
        records = contract.functions.getRecords().call()
        log_backend("LEDGER_SYNC", f"Retrieved {len(records)} entries.")
        return jsonify([{
            "temperature": r[0], "location": r[1],
            "timestamp": r[2], "status": r[3]
        } for r in records][::-1])
    except Exception as e:
        log_backend("LEDGER_READ_FAIL", traceback.format_exc())
        return jsonify({"error": "Read Error", "details": str(e)}), 500

@app.route("/simulate", methods=["POST", "OPTIONS"])
def simulate_entry():
    if request.method == "OPTIONS": return "", 204
    
    log_backend("API_CALL", "POST /simulate", request.json)
    data = request.json or {}
    temp = data.get("temperature", random.randint(3, 10))
    loc = data.get("location", "Front-End Controller")
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    st = data.get("status", "System Proof")

    result = store_on_blockchain(temp, loc, ts, st)
    
    # Success check: result should be a transaction hash (starts with 0x and is 66 chars)
    if isinstance(result, str) and result.startswith("0x") and len(result) == 66:
        log_backend("API_SUCCESS", "Record created.")
        return jsonify({"message": "Successfully Recorded!", "tx_hash": result}), 201
    else:
        log_backend("API_FAILURE", "Ledger storage failed.")
        return jsonify({
            "error": "Blockchain write failed", 
            "details": result # Full error traceback
        }), 500

@app.route("/")
def home():
    log_backend("API_CALL", "GET / Pulse check")
    return jsonify({
        "status": "Online", 
        "chain": contract is not None,
        "active_address": contract.address if contract else "not-connected"
    })

if __name__ == "__main__":
    log_backend("STARTUP", "Initializing Food Traceability Backend on Port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=True)