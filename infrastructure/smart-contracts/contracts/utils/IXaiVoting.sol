// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IXaiVoting {
    function onUpdateBalance(address from, address to, uint256 value) external;
}
