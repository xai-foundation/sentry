// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title NodeLicenseUpgradeTest
 * @dev Implementation of the NodeLicenseUpgradeTest
 */
contract NodeLicenseUpgradeTest is ERC721EnumerableUpgradeable, AccessControlUpgradeable {

    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    address payable public fundsReceiver;
    uint256 public maxSupply; // Maximum number of licenses that can be minted
    Tier[] private pricingTiers;
    uint256 public referralDiscountPercentage;
    uint256 public referralRewardPercentage;
    bool public claimable;
    mapping (uint256 => uint256) private _mintTimestamps;
    mapping (string => PromoCode) private _promoCodes;
    mapping (address => uint256) private _referralRewards;
    mapping (uint256 => uint256) private _averageCost;

    uint256 private _count;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[499] private __gap;

    // Define the pricing tiers
    struct Tier {
        uint256 price;
        uint256 quantity;
    }

    // Define the PromoCode struct
    struct PromoCode {
        address recipient;
        bool active;
        uint256 receivedLifetime;
    }

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

    /**
     * @notice Overrides the supportsInterface function of the AccessControl contract.
     * @param interfaceId The interface id.
     * @return A boolean value indicating whether the contract supports the given interface.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721EnumerableUpgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}