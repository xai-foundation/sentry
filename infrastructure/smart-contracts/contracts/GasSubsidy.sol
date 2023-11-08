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

    /**
     * @dev Function to add an admin
     * @param admin The address to grant the admin role.
     */
    function addAdmin(address admin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(TRANSFER_ROLE, admin);
    }

    /**
     * @dev Function to remove an admin
     * @param admin The address to revoke the admin role.
     */
    function removeAdmin(address admin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(TRANSFER_ROLE, admin);
    }
}