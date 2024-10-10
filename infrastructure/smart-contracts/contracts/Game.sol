// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title Game Contract
 * @dev An ERC1155 contract that represents game items and achievements.
 */
contract Game {
    
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    /**
     * @dev Logs a successful contract production from the factory.
     * @param contractAddress Address of newly produced contract.
     * @param producedBy Address that initiated production.
     */
    event ContractProduced(address contractAddress, address producedBy);

    constructor() {}

}
