const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

async function checkBalances() {
    try {
        const accounts = await provider.listAccounts();
        console.log("Found accounts:", accounts.length);
        for (let i = 0; i < Math.min(accounts.length, 5); i++) {
            const balance = await provider.getBalance(accounts[i].address);
            console.log(`Account ${i}: ${accounts[i].address} - Balance: ${ethers.formatEther(balance)} ETH`);
        }
    } catch (err) {
        console.error("Error connecting to Ganache:", err.message);
    }
}

checkBalances();
