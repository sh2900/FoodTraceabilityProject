// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TraceChain {

    struct LogEntry {
        string productId;
        uint256 timestamp;
        string dataHash;
        address actor;
    }

    // Mapping from productId to its blockchain log entries
    mapping(string => LogEntry[]) private productLogs;
    LogEntry[] private allLogs;

    event DataStored(string indexed productId, string dataHash, address actor, uint256 timestamp);

    // Store a hash of the product data on-chain
    function storeDataHash(string memory _productId, string memory _dataHash) public {
        LogEntry memory newEntry = LogEntry({
            productId: _productId,
            timestamp: block.timestamp,
            dataHash: _dataHash,
            actor: msg.sender
        });

        productLogs[_productId].push(newEntry);
        allLogs.push(newEntry);

        emit DataStored(_productId, _dataHash, msg.sender, block.timestamp);
    }

    // Retrieve all logs for a specific product
    function getLogs(string memory _productId) public view returns (LogEntry[] memory) {
        return productLogs[_productId];
    }

    // Retrieve all logs (for Admin)
    function getAllLogs() public view returns (LogEntry[] memory) {
        return allLogs;
    }

    // Verify if a hash exists for a product (Integrity check)
    function verifyIntegrity(string memory _productId, string memory _dataHash) public view returns (bool) {
        LogEntry[] memory logs = productLogs[_productId];
        for (uint i = 0; i < logs.length; i++) {
            if (keccak256(abi.encodePacked(logs[i].dataHash)) == keccak256(abi.encodePacked(_dataHash))) {
                return true;
            }
        }
        return false;
    }
}
