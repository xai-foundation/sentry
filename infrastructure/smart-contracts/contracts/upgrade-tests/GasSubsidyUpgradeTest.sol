// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title GasSubsidyUpgradeTest
 * @dev Implementation of the GasSubsidyUpgradeTest
 */
contract GasSubsidyUpgradeTest is AccessControlUpgradeable {

    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");
    uint256 private _count;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[499] private __gap;

    /**
     * @dev Function to increment the count
     */
    function increment() public {
        _count += 1;
    }

    /**
     * @dev Function to get the count
     * @return The current count
     */
    function getCount() public view returns (uint256) {
        return _count;
    }
}
