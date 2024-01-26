// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title EthExtractor
 * @dev This contract allows specified admins to extract all the ETH that are deposited at the address that the contract is deployed to, and send it to any address they wish.
 */
contract EthExtractor is AccessControl {
    bytes32 public constant EXTRACT_ROLE = keccak256("EXTRACT_ROLE");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(EXTRACT_ROLE, msg.sender);
    }

    /**
     * @dev Function to extract all ETH from the contract
     * @param recipient The address to receive the ETH.
     */
    function extractETH(address payable recipient) public onlyRole(EXTRACT_ROLE) {
        require(address(this).balance > 0, "No ETH to extract");
        recipient.transfer(address(this).balance);
    }
}
