// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title GameFactory
 * @dev A factory contract that produces ERC1155 token contracts.
 */
contract GameFactory {
    
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    uint256 public productionCount;

    // mapping(string => address) public contractsByName;
    // mapping(uint256 => address) public contractsById;

    /**
     * @dev Logs a successful contract production from the factory.
     * @param contractAddress Address of newly produced contract.
     * @param producedBy Address that initiated production.
     */
    event ContractProduced(address contractAddress, address producedBy);

    constructor() {}

    /**
     * @dev Produces a new ERC1155 token contract from the factory.
     * @param uri URI representing a link to the token's metadata.
     * @return address Address of the newly produced token contract.
     */
    function produceContract(string memory uri) public returns (address) {
        ERC1155 newContract = new ERC1155(uri);
        productionCount += 1;
        emit ContractProduced(address(newContract), msg.sender);
        return address(newContract);
    }


}
