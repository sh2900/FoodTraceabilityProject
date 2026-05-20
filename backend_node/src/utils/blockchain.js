const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractABI = [
  "function storeDataHash(string memory _productId, string memory _dataHash) public",
  "function getLogs(string memory _productId) public view returns (tuple(string productId, uint256 timestamp, string dataHash, address actor)[])",
  "function getAllLogs() public view returns (tuple(string productId, uint256 timestamp, string dataHash, address actor)[])",
  "function verifyIntegrity(string memory _productId, string memory _dataHash) public view returns (bool)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDR, contractABI, wallet);

const storeOnBlockchain = async (productId, dataHash) => {
  try {
    console.log(`Storing hash on blockchain for ${productId}...`);
    // Force legacy transaction (Type 0) and explicit gas price for Ganache compatibility
    const tx = await contract.storeDataHash(productId, dataHash, {
      type: 0,
      gasPrice: ethers.parseUnits('20', 'gwei')
    });
    await tx.wait();
    console.log(`Transaction successful: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error('Blockchain storage error:', error);
    return null;
  }
};

const getBlockchainLogs = async (productId) => {
  try {
    const logs = await contract.getLogs(productId);
    return logs.map(log => ({
      productId: log.productId,
      timestamp: Number(log.timestamp),
      dataHash: log.dataHash,
      actor: log.actor
    }));
  } catch (error) {
    console.error('Blockchain retrieval error:', error);
    return [];
  }
};

const getAllBlockchainLogs = async () => {
  try {
    const logs = await contract.getAllLogs();
    return logs.map(log => ({
      productId: log.productId,
      timestamp: Number(log.timestamp),
      dataHash: log.dataHash,
      actor: log.actor
    }));
  } catch (error) {
    console.error('Global blockchain retrieval error:', error);
    return [];
  }
};

module.exports = { storeOnBlockchain, getBlockchainLogs, getAllBlockchainLogs };
