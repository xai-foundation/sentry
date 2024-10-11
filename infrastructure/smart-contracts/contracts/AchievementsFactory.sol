// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./Achievements.sol";

/**
 * @title AchievementsFactory
 * @dev A factory contract that produces ERC1155 token contracts.
 */
contract AchievementsFactory is AccessControl {
    
    //constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE"); //0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE"); //0x154c00819833dac601ee5ddded6fda79d9d8b506b911b3dbd54cdb95fe6c3686

    //state
    uint256 public productionCount; //number of contracts produced by this factory
    mapping(string => address) public contractsById; //gameId => tokenContract

    /**
     * @dev Logs a successful contract production from the factory.
     * @param contractAddress Address of newly produced contract.
     * @param gameId GameID that was assigned to newly produced contract.
     * @param producedBy Address that initiated production.
     */
    event ContractProduced(address contractAddress, string gameId, address producedBy);

    /**
     * @dev AchievementsFactory constructor. Sets up AccessControl roles.
     * @param _initialMintAdmin Address that will initially hold the MINT_ROLE and ADMIN_ROLE.
     */
    constructor(address _initialMintAdmin) {
        _setRoleAdmin(MINT_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, _initialMintAdmin);
        _setupRole(MINT_ROLE, _initialMintAdmin);
    }

    /**
     * @dev Produces a new ERC1155 token contract from the factory.
     * @param gameId Unique string representing the ID for a game title.
     * @param uri URI representing a link to the token's metadata.
     * @return address Address of the newly produced token contract.
     */
    function produceContract(string memory gameId, string memory uri) public returns (address) {
        require(contractsById[gameId] == address(0x0), "game id already exists");

        Achievements newContract = new Achievements(address(this), uri);
        contractsById[gameId] = address(newContract);
        productionCount += 1;

        emit ContractProduced(address(newContract), gameId, msg.sender);

        return address(newContract);
    }

}
