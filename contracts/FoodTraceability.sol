// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract FoodTraceability {

    struct Record {
        uint temperature;
        string location;
        string timestamp;
        string status;
    }

    Record[] public records;

    function addRecord(
        uint _temperature,
        string memory _location,
        string memory _timestamp,
        string memory _status
    ) public {
        records.push(Record(_temperature, _location, _timestamp, _status));
    }

    function getRecords() public view returns (Record[] memory) {
        return records;
    }
}