// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IPoolFactory {
    function getTotalesXaiStakedByUser(
        address user
    ) external view returns (uint256);
}

contract SampleXaiVoting {
    
    event OnTestUpdate(address from, address to, uint256 value);
    function onUpdateBalance(
        address from,
        address to,
        uint256 value
    ) external {
        emit OnTestUpdate(from, to, value);
    }
}
