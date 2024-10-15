// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../Achievements.sol";

/**
 * @title AchievementsFactory2
 * @dev A factory contract that produces ERC1155 token contracts.
 */
contract AchievementsFactory2 is Initializable, AccessControlUpgradeable {
    
    //constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE"); //0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE"); //0x154c00819833dac601ee5ddded6fda79d9d8b506b911b3dbd54cdb95fe6c3686

    //state
    uint256 public productionCount; //number of contracts produced by this factory
    mapping(string => address) public contractsById; //gameId => tokenContract
    uint256 public test; //variable used for testing upgrades

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[499] private __gap;

    /**
     * @dev Logs a successful contract production from the factory.
     * @param contractAddress Address of newly produced contract.
     * @param gameId GameID that was assigned to newly produced contract.
     * @param producedBy Address that initiated production.
     */
    event ContractProduced(address contractAddress, string gameId, address producedBy);

    /**
     * @dev AchievementsFactory initializer. Sets up AccessControl roles.
     * @param _test Test value for checking successful upgrade.
     */
    function initialize(uint256 _test) public reinitializer(2) {
        test = _test;
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

    /**
     * @notice Overrides the supportsInterface function of the AccessControlUpgradeable contract.
     * @param interfaceId The interface id.
     * @return Boolean value indicating whether the contract supports the given interface.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId) || AccessControlUpgradeable.supportsInterface(interfaceId);
    }

}
