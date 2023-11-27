// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title GasSubsidy
 * @dev This contract allows specified admins to transfer any ERC20 token that the contract holds. Specifically will be used to hold gas for subsidizing users of the chain.
 */
contract GasSubsidy is AccessControlUpgradeable {
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    function initialize() public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TRANSFER_ROLE, msg.sender);
    }

    /**
     * @dev Function to transfer tokens to a recipient
     * @param token The ERC20 token to transfer.
     * @param recipient The address to receive the tokens.
     * @param amount The amount of tokens to transfer.
     */
    function transferTokens(IERC20Upgradeable token, address recipient, uint256 amount) public onlyRole(TRANSFER_ROLE) {
        require(token.balanceOf(address(this)) >= amount, "Not enough tokens in contract");
        token.transfer(recipient, amount);
    }
}