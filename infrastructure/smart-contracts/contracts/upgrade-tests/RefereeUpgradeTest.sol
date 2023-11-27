// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "../Referee.sol";

/**
 * @title RefereeUpgradeTest
 * @dev Implementation of the RefereeUpgradeTest
 */
contract RefereeUpgradeTest is AccessControlEnumerableUpgradeable {

    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    bytes32 public constant CHALLENGER_ROLE = keccak256("CHALLENGER_ROLE");
    bytes32 public constant KYC_ADMIN_ROLE = keccak256("KYC_ADMIN_ROLE");

    bytes public challengerPublicKey;
    address public rollupAddress;
    address public nodeLicenseAddress;
    address public esXaiAddress;
    address public xaiAddress;
    uint256 public challengeCounter;
    address public gasSubsidyRecipient;
    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => mapping(uint256 => Submission)) public submissions;
    bool public isCheckingAssertions;
    mapping (address => EnumerableSetUpgradeable.AddressSet) private _operatorApprovals;
    mapping (address => EnumerableSetUpgradeable.AddressSet) private _ownersForOperator;
    mapping (address => uint256) private _lifetimeClaims;
    mapping (bytes32 => bool) public rollupAssertionTracker;
    EnumerableSetUpgradeable.AddressSet private kycWallets;
    uint256 private _allocatedTokens;
    uint256 private _gasSubsidyPercentage;
    uint256 private _count;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[499] private __gap;

    struct Submission {
        bool submitted;
        bool claimed;
        bool eligibleForPayout;
        uint256 nodeLicenseId;
        bytes successorStateRoot;
    }

    struct Challenge {
        bool openForSubmissions; // when the next challenge is submitted for the following assertion, this will be closed.
        bool expiredForRewarding; // when this is true, this challenge is no longer eligible for claiming
        uint64 assertionId;
        bytes32 assertionStateRoot;
        uint64 assertionTimestamp; // equal to the block number the assertion was made on in the rollup protocol
        bytes challengerSignedHash;
        bytes activeChallengerPublicKey; // The challengerPublicKey that was active at the time of challenge submission
        address rollupUsed; // The rollup address used for this challenge
        uint256 createdTimestamp; // used to determine if a node license is eligible to submit
        uint256 totalSupplyOfNodesAtChallengeStart; // keep track of what the total supply opf nodes is when the challenge starts
        uint256 rewardAmountForClaimers; // this is how much esXai should be allocated to the claimers
        uint256 amountForGasSubsidy; // this is how much Xai was minted for the gas subsidy
        uint256 numberOfEligibleClaimers; // how many submitters are eligible for claiming, used to determine the reward amount
        uint256 amountClaimedByClaimers; // keep track of how much Xai has been claimed by the claimers, primarily used to expire unclaimed rewards 
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
}


