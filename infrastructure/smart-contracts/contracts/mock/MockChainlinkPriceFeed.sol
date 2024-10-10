// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;



/**
 * @title Mock Chainlink Price Feed
 * @notice Mock Chainlink Price Feed contract for testing purposes
 */
contract MockChainlinkPriceFeed  {

    int256 private price;

    constructor(int256 _price) {
        price = _price;
    }

    function latestAnswer() external view returns (int256) {
        return int256(price);
    }

}