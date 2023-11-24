// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

/**
 * @title esXaiUpgradeTest
 * @dev Implementation of the esXaiUpgradeTest
 */
contract esXaiUpgradeTest is ERC20Upgradeable, ERC20BurnableUpgradeable, AccessControlUpgradeable {

    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    EnumerableSetUpgradeable.AddressSet private _whitelist;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    address private _xai;
    bool private _redemptionActive;
    mapping(address => RedemptionRequest[]) private _redemptionRequests;
    uint256 private _count;

    struct RedemptionRequest {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        bool completed;
    }

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

