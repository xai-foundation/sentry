// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

interface IAggregatorV3Interface {
    function latestAnswer() external view returns (int256);
}

/**
 * @title NodeLicenseUpgradeTest
 * @dev Implementation of the NodeLicenseUpgradeTest
 */
contract NodeLicenseUpgradeTest is
    ERC721EnumerableUpgradeable,
    AccessControlUpgradeable
{
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    address payable public fundsReceiver;

    uint256 public maxSupply; // Maximum number of licenses that can be minted

    // Define the pricing table
    Tier[] private pricingTiers;

    uint256 public referralDiscountPercentage;
    uint256 public referralRewardPercentage;

    // Boolean to control whether referral rewards can be claimed
    bool public claimable;

    // Mapping from token ID to minting timestamp
    mapping(uint256 => uint256) private _mintTimestamps;

    // Mapping from promo code to PromoCode struct
    mapping(string => PromoCode) private _promoCodes;

    // Mapping from referral address to referral reward
    mapping(address => uint256) private _referralRewards;

    // Mapping from token ID to average cost, this is used for refunds over multiple tiers
    mapping(uint256 => uint256) private _averageCost;

    // Mapping for whitelist to claim NFTs without a price
    mapping(address => uint16) public whitelistAmounts;

    /**
     *  @dev New promo code mappings are ONLY used for
     *  reward tracking of XAI and esXAI rewards
     *  The original promo code mapping is used for promo
     *  code creation, removal, activation and recipient tracking
     *
     *  @notice The new mappings should not be checked for
     *  promo code existence or activation, they simply track
     *  the referral rewards for XAI and esXAI
     */

    // Mapping from promo code to PromoCode struct for Xai
    mapping(string => PromoCode) private _promoCodesXai;

    // Mapping from promo code to PromoCode struct for esXai
    mapping(string => PromoCode) private _promoCodesEsXai;

    // Mapping from referral address to referral reward
    mapping(address => uint256) private _referralRewardsXai;

    // Mapping from referral address to referral reward
    mapping(address => uint256) private _referralRewardsEsXai;

    // Chainlink Eth/USD price feed
    IAggregatorV3Interface internal ethPriceFeed;

    //Chainlink XAI/USD price feed
    IAggregatorV3Interface internal xaiPriceFeed;

    // Token Addresses
    address public xaiAddress;
    address public esXaiAddress;

    // Pause Minting
    bool public mintingPaused;

    bytes32 public constant AIRDROP_ADMIN_ROLE =
        keccak256("AIRDROP_ADMIN_ROLE");

    uint256 private _count;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[490] private __gap;

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
    )
        public
        view
        override(ERC721EnumerableUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
