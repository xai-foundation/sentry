// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./esXai.sol";

/**
 * @title Xai
 * @dev Implementation of the Xai
 */
contract Xai is ERC20Upgradeable, ERC20BurnableUpgradeable, AccessControlUpgradeable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public constant MAX_SUPPLY = 2500000000 * 10**18; // Max supply of 2,500,000,000 tokens
    address private _esXai;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    function initialize() public initializer {
        __ERC20_init("Xai", "XAI");
        __ERC20Burnable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(MINTER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    /**
     * @dev Function to set esXai address
     * @param newEsXaiAddress The new esXai address.
     */
    function setEsXaiAddress(address newEsXaiAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _esXai = newEsXaiAddress;
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) returns (bool) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Cannot mint beyond max supply"); // not needed for testnet
        _mint(to, amount);
        return true;
    }

    /**
     * @dev Function to convert Xai to esXai
     * @param amount The amount of Xai to convert.
     */
    function convertToEsXai(uint256 amount) public {
        require(_esXai != address(0), "esXai contract address not set");
        _burn(msg.sender, amount);
        esXai(_esXai).mint(msg.sender, amount);
    }
}
