const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend_node/.env') });

const web3 = new Web3(process.env.RPC_URL);
const contractJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../build/contracts/TraceChain.json'), 'utf8')
);

const contract = new web3.eth.Contract(
  contractJson.abi,
  process.env.CONTRACT_ADDR
);

async function debug() {
    try {
        const productID = "DEMO-BATCH-2024";
        console.log(`Checking audit trail for: ${productID}`);
        console.log(`Contract Address: ${process.env.CONTRACT_ADDR}`);
        
        const trail = await contract.methods.getAuditTrail(productID).call();
        console.log("Success! Trail length:", trail.length);
        console.log("First item:", trail[0]);
    } catch (err) {
        console.error("DEBUG ERROR:", err);
    }
}

debug();
