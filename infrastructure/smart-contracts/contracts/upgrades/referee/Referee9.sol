// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../../nitro-contracts/rollup/IRollupCore.sol";
import "../../NodeLicense.sol";
import "../../Xai.sol";
import "../../esXai.sol";
import "../pool-factory/PoolFactory2.sol";
import "../../RefereeCalculations.sol";

// Error Codes
// 1: Only PoolFactory can call this function.
// 2: Index out of bounds.
// 3: Index out of bounds.
// 4: Index out of bounds.
// 5: There are no more tiers, we are too close to the end.
// 6: There are no more accurate tiers.
// 7: Rollup address must be set before submitting a challenge.
// 8: Challenger public key must be set before submitting a challenge.
// 9: This assertionId and rollupAddress combo has already been submitted.
// 10: The _predecessorAssertionId is incorrect.
// 11: The _confirmData is incorrect.
// 12: The _assertionTimestamp did not match the block this assertion was created at.
// 13: Challenge with this id has not been created.
// 14: Challenge is not open for submissions.
// 15: _nodeLicenseId has already been submitted for this challenge.
// 16: Challenge is not open for submissions.
// 17: Caller must be the owner of the NodeLicense, an approved operator, or the delegator owner of the pool.
// 18: The Challenge does not exist for this id.
// 19: Challenge is still open for submissions.
// 20: Challenge rewards have expired.
// 21: NodeLicense is not eligible for a payout on this challenge, it was minted after it started.
// 22: Owner of the NodeLicense is not KYC'd.
// 23: This submission has already been claimed.
// 24: Not valid for a payout.
// 25: The Challenge does not exist for this id.
// 26: Challenge is still open for submissions.
// 27: Challenge rewards have expired.
// 28: The Challenge does not exist for this id.
// 29: Challenge is not old enough to expire rewards.
// 30: The challenge is already expired.
// 31: Invalid max amount.
// 32: Invalid max amount.
// 33: Invalid boost factor.
// 34: Threshold needs to be monotonically increasing.
// 35: Threshold needs to be monotonically increasing.
// 36: Threshold needs to be monotonically increasing.
// 37: Invalid boost factor.
// 38: Threshold needs to be monotonically increasing.
// 39: Cannot remove last tier.
// 40: Index out of bounds.
// 41: Insufficient amount staked.
// 42: Must complete KYC.
// 43: Maximum staking amount exceeded.
// 44: Key already assigned.
// 45: Not owner of key.
// 46: Pool owner needs at least 1 staked key.
// 47: Key not assigned to pool.
// 48: Not owner of key.
// 49: Maximum staking amount exceeded.
// 50: Invalid amount.
// 51: Invalid stake rewards tier percentage.
// 52: Staking Temporarily Disabled.
// 53: Pool has already been submitted for this challenge.
// 54: Pool has not submitted for this challenge.
// 55: Cannot stake mixed keys. All keys must be same status (submitted or not submitted) for the current challenge.
// 56: Only NodeLicense contract can call this function.

contract Referee9 is Initializable, AccessControlEnumerableUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    // Define roles
    bytes32 public constant CHALLENGER_ROLE = keccak256("CHALLENGER_ROLE");
    bytes32 public constant KYC_ADMIN_ROLE = keccak256("KYC_ADMIN_ROLE");

    // The Challenger's public key of their registered BLS-Pair
    bytes public challengerPublicKey;

    // the address of the rollup, so we can get assertions
    address public rollupAddress;

    // the address of the NodeLicense NFT
    address public nodeLicenseAddress;

    // contract addresses for esXai and xai
    address public esXaiAddress;
    address public xaiAddress;

    // Counter for the challenges
    uint256 public challengeCounter;

    // This is the address where we sent the Xai emission to for the gas subsidy
    address public gasSubsidyRecipient;

    // mapping to store all of the challenges
    mapping(uint256 => Challenge) public challenges;

    // Mapping to store all of the submissions
    mapping(uint256 => mapping(uint256 => Submission)) public submissions;

    // Toggle for assertion checking
    bool public isCheckingAssertions;

    // Mapping from owner to operator approvals
    mapping (address => EnumerableSetUpgradeable.AddressSet) private _operatorApprovals;

    // Mapping from operator to owners
    mapping (address => EnumerableSetUpgradeable.AddressSet) private _ownersForOperator;

    // Mappings to keep track of all claims
    mapping (address => uint256) public _lifetimeClaims;

    // Mapping to track rollup assertions (combination of the assertionId and the rollupAddress used, because we allow switching the rollupAddress, and can't assume assertionIds are unique.)
    mapping (bytes32 => bool) public rollupAssertionTracker;

    // Mapping to track KYC'd wallets
    EnumerableSetUpgradeable.AddressSet private kycWallets;

    // This value keeps track of how many token are not yet minted but are allocated by the referee. This should be used in calculating the total supply for emissions
    uint256 private _allocatedTokens;

    // This is the percentage of each challenge emission to be given to the gas subsidy. Should be a whole number like 15% = 15
    uint256 private _gasSubsidyPercentage;

    // Mapping for users staked amount in V1 staking
    mapping(address => uint256) public stakedAmounts;

    // Minimum amounts of staked esXai to be in the tier of the respective index
    uint256[] public stakeAmountTierThresholds;

    // Reward chance boost factor based on tier of the respective index
    uint256[] public stakeAmountBoostFactors;

    // The maximum amount of esXai (in wei) that can be staked per NodeLicense
    uint256 public maxStakeAmountPerLicense;
    
    // Enabling staking on the Referee
    bool public stakingEnabled;

    // Mapping for a key id assigned to a staking pool
    mapping(uint256 => address) public assignedKeyToPool;

    // Mapping for pool to assigned key count for calculating max stake amount
    mapping(address => uint256) public assignedKeysToPoolCount;

    // The maximum number of NodeLicenses that can be staked to a pool
    uint256 public maxKeysPerPool;

    // The pool factory contract that is allowed to update the stake state of the Referee
    address public poolFactoryAddress;
    
    // Mapping for amount of assigned keys of a user
    mapping(address => uint256) public assignedKeysOfUserCount;

    // Mapping to store all of the pool submissions
    mapping(uint256 => mapping(address => PoolSubmission)) public poolSubmissions;

    // Referee Calculations contract address
    address public refereeCalculationsAddress;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[488] private __gap;

    // Struct for the submissions
    struct Submission {
        bool submitted;
        bool claimed;
        bool eligibleForPayout;
        uint256 nodeLicenseId;
        bytes assertionStateRootOrConfirmData;
    }

    // Struct for PoolSubmissions
    struct PoolSubmission {
        bool submitted;
        bool claimed;
        uint256 stakedKeyCount;
        uint256 winningKeyCount;
        bytes assertionStateRootOrConfirmData;
    }

    // Struct for the challenges
    struct Challenge {
        bool openForSubmissions; // when the next challenge is submitted for the following assertion, this will be closed.
        bool expiredForRewarding; // when this is true, this challenge is no longer eligible for claiming
        uint64 assertionId;
        bytes32 assertionStateRootOrConfirmData; // Depending on the BOLD 2 deployment, this will either be the assertionStateRoot or ConfirmData
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

    // Event Definitions    
    event ChallengeSubmitted(uint256 indexed challengeNumber);
    event ChallengeClosed(uint256 indexed challengeNumber);
    event AssertionSubmitted(uint256 indexed challengeId, uint256 indexed nodeLicenseId);
    event RollupAddressChanged(address newRollupAddress);
    event ChallengerPublicKeyChanged(bytes newChallengerPublicKey);
    event NodeLicenseAddressChanged(address newNodeLicenseAddress);
    event AssertionCheckingToggled(bool newState);
    event Approval(address indexed owner, address indexed operator, bool approved);
    event KycStatusChanged(address indexed wallet, bool isKycApproved);
    event InvalidSubmission(uint256 indexed challengeId, uint256 nodeLicenseId);
    event InvalidBatchSubmission(uint256 indexed challengeId, address operator, uint256 keysLength);
    event RewardsClaimed(uint256 indexed challengeId, uint256 amount);
    event BatchRewardsClaimed(uint256 indexed challengeId, uint256 totalReward, uint256 keysLength);
    event PoolRewardsClaimed(uint256 indexed challengeId, address indexed poolAddress, uint256 totalReward, uint256 winningKeys);
    event ChallengeExpired(uint256 indexed challengeId);
    event StakingEnabled(bool enabled);
    event UpdateMaxStakeAmount(uint256 prevAmount, uint256 newAmount);
    event UpdateMaxKeysPerPool(uint256 prevAmount, uint256 newAmount);
    event StakedV1(address indexed user, uint256 amount, uint256 totalStaked);
    event UnstakeV1(address indexed user, uint256 amount, uint256 totalStaked);
    event NewPoolSubmission(uint256 indexed challengeId, address indexed poolAddress, uint256 stakedKeys, uint256 winningKeys);
    event UpdatePoolSubmission(uint256 indexed challengeId, address indexed poolAddress, uint256 stakedKeys, uint256 winningKeys, uint256 increase, uint256 decrease);

    event AssertionSubmittedV2(uint256 indexed challengeId, uint256 indexed nodeLicenseId, bytes assertionStateRootOrConfirmData, bool eligibleForPayout);
    event RewardsClaimedV2(uint256 indexed challengeId, uint256 indexed nodeLicenseId, uint256 amount);
    event AssertionCancelled(uint256 indexed challengeId, uint256 indexed nodeLicenseId);

    function initialize(address _refereeCalculationsAddress) public reinitializer(7) {

        refereeCalculationsAddress = _refereeCalculationsAddress;

        //TODO update with correct values on deploy
        // maxStakeAmountPerLicense = 2_000_000 * 10 ** 18;
        // maxKeysPerPool = 100_000;
    }

    modifier onlyPoolFactory() {
        require(msg.sender == poolFactoryAddress, "1");
        _;
    }

    /**
     * @notice Returns the combined total supply of esXai Xai, and the unminted allocated tokens.
     * @dev This function fetches the total supply of esXai, Xai, and unminted allocated tokens and returns their sum.
     * @return uint256 The combined total supply of esXai, Xai, and the unminted allocated tokens.
     */
    function getCombinedTotalSupply() public view returns (uint256) {
        return esXai(esXaiAddress).totalSupply() + Xai(xaiAddress).totalSupply() + _allocatedTokens;
    }

    /**

     * @notice Approve or remove `operator` to submit assertions on behalf of `msg.sender`.
     * @param operator The operator to be approved or removed.
     * @param approved Represents the status of the approval to be set.
     */
    function setApprovalForOperator(address operator, bool approved) external {
        if (approved) {
            _operatorApprovals[msg.sender].add(operator);
            _ownersForOperator[operator].add(msg.sender);
        } else {
            _operatorApprovals[msg.sender].remove(operator);
            _ownersForOperator[operator].remove(msg.sender);
        }
        emit Approval(msg.sender, operator, approved);
    }

    /**
     * @notice Check if `operator` is approved to submit assertions on behalf of `owner`.
     * @param owner The address of the owner.
     * @param operator The address of the operator to query.
     * @return Whether the operator is approved.
     */
    function isApprovedForOperator(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner].contains(operator);
    }

    /**
     * @notice Get the approved operator at a given index of the owner.
     * @param owner The address of the owner.
     * @param index The index of the operator to query.
     * @return The address of the operator.
     */
    function getOperatorAtIndex(address owner, uint256 index) public view returns (address) {
        require(index < getOperatorCount(owner), "2");
        return _operatorApprovals[owner].at(index);
    }

    /**
     * @notice Get the count of operators for a particular address.
     * @param owner The address of the owner.
     * @return The count of operators.
     */
    function getOperatorCount(address owner) public view returns (uint256) {
        return _operatorApprovals[owner].length();
    }

    /**
     * @notice Get the owner who has approved a specific operator at a given index.
     * @param operator The operator to query.
     * @param index The index of the owner to query.
     * @return The address of the owner.
     */
    function getOwnerForOperatorAtIndex(address operator, uint256 index) public view returns (address) {
        require(index < _ownersForOperator[operator].length(), "3");
        return _ownersForOperator[operator].at(index);
    }

    /**
     * @notice Get the count of owners for a particular operator.
     * @param operator The operator to query.
     * @return The count of owners.
     */
    function getOwnerCountForOperator(address operator) public view returns (uint256) {
        return _ownersForOperator[operator].length();
    }

    /**
     * @notice Add a wallet to the KYC'd list.
     * @param wallet The wallet to be added.
     */
    function addKycWallet(address wallet) external onlyRole(KYC_ADMIN_ROLE) {
        kycWallets.add(wallet);
        emit KycStatusChanged(wallet, true);
    }

    /**
     * @notice Remove a wallet from the KYC'd list.
     * @param wallet The wallet to be removed.
     */
    function removeKycWallet(address wallet) external onlyRole(KYC_ADMIN_ROLE) {
        kycWallets.remove(wallet);
        emit KycStatusChanged(wallet, false);
    }

    /**
     * @notice Check the KYC status of a wallet.
     * @param wallet The wallet to check.
     * @return Whether the wallet is KYC'd.
     */
    function isKycApproved(address wallet) public view returns (bool) {
        return kycWallets.contains(wallet);
    }

    /**
     * @notice Get the KYC'd wallet at a given index.
     * @param index The index of the wallet to query.
     * @return The address of the wallet.
     */
    function getKycWalletAtIndex(uint256 index) public view returns (address) {
        require(index < getKycWalletCount(), "4");
        return kycWallets.at(index);
    }

    /**
     * @notice Get the count of KYC'd wallets.
     * @return The count of KYC'd wallets.
     */
    function getKycWalletCount() public view returns (uint256) {
        return kycWallets.length();
    }

    /**
     * @notice Calculate the emission and tier for a challenge.
     * @dev This function uses a halving formula to determine the emission tier and challenge emission.
     * The formula is as follows: 
     * 1. Start with the max supply divided by 2 as the initial emission tier.
     * 2. The challenge emission is the emission tier divided by 17520.
     * 3. While the total supply is less than the emission tier, halve the emission tier and challenge emission.
     * 4. The function returns the challenge emission and the emission tier.
     * 
     * For example, if the max supply is 2,500,000,000:
     * - Tier 1: 1,250,000,000 (max supply / 2), Challenge Emission: 71,428 (emission tier / 17520)
     * - Tier 2: 625,000,000 (emission tier / 2), Challenge Emission: 35,714 (challenge emission / 2)
     * - Tier 3: 312,500,000 (emission tier / 2), Challenge Emission: 17,857 (challenge emission / 2)
     * - Tier 4: 156,250,000 (emission tier / 2), Challenge Emission: 8,928 (challenge emission / 2)
     * - Tier 5: 78,125,000 (emission tier / 2), Challenge Emission: 4,464 (challenge emission / 2)
     * 
     * @return uint256 The challenge emission.
     * @return uint256 The emission tier.
     */
     function calculateChallengeEmissionAndTier() public view returns (uint256, uint256) {
        uint256 totalSupply = getCombinedTotalSupply();  
        uint256 maxSupply = Xai(xaiAddress).MAX_SUPPLY();
        return RefereeCalculations(refereeCalculationsAddress).calculateChallengeEmissionAndTier(totalSupply, maxSupply);
    }

    /**
     * @notice Submits a challenge to the contract.
     * @dev This function verifies the caller is the challenger, checks if an assertion hasn't already been submitted for this ID,
     * gets the node information from the rollup, verifies the data inside the hash matched the data pulled from the rollup contract,
     * adds the challenge to the mapping, and emits the ChallengeSubmitted event.
     * @param _assertionId The ID of the assertion.
     * @param _predecessorAssertionId The ID of the predecessor assertion.
     * @param _confirmData The confirm data of the assertion. This will change with implementation of BOLD 2
     * @param _assertionTimestamp The timestamp of the assertion.
     * @param _challengerSignedHash The signed hash from the challenger.
     */
    function submitChallenge(
        uint64 _assertionId,
        uint64 _predecessorAssertionId,
        bytes32 _confirmData,
        uint64 _assertionTimestamp,
        bytes memory _challengerSignedHash
    ) public onlyRole(CHALLENGER_ROLE) {

        // check the rollupAddress is set
        require(rollupAddress != address(0), "7");

        // check the challengerPublicKey is set
        require(challengerPublicKey.length != 0, "8");

        // check the assertionId and rollupAddress combo haven't been submitted yet
        bytes32 comboHash = keccak256(abi.encodePacked(_assertionId, rollupAddress));
        require(!rollupAssertionTracker[comboHash], "9");
        rollupAssertionTracker[comboHash] = true;

        // verify the data inside the hash matched the data pulled from the rollup contract
        if (isCheckingAssertions) {

            // get the node information from the rollup.
            Node memory node = IRollupCore(rollupAddress).getNode(_assertionId);

            require(node.prevNum == _predecessorAssertionId, "10");
            require(node.confirmData == _confirmData, "11");
            require(node.createdAtBlock == _assertionTimestamp, "12");
        }
        
        // we need to determine how much token will be emitted
        (uint256 challengeEmission,) = calculateChallengeEmissionAndTier();

        // mint part of this for the gas subsidy contract
        uint256 amountForGasSubsidy = (challengeEmission * _gasSubsidyPercentage) / 100;

        // mint xai for the gas subsidy
        Xai(xaiAddress).mint(gasSubsidyRecipient, amountForGasSubsidy);

        // the remaining part of the emission should be tracked and later allocated when claimed
        uint256 rewardAmountForClaimers = challengeEmission - amountForGasSubsidy;

        // add the amount that will be given to claimers to the allocated field variable amount, so we can track how much esXai is owed
        _allocatedTokens += rewardAmountForClaimers;

        // close the previous challenge with the start of the next challenge
        if (challengeCounter > 0) {
            challenges[challengeCounter - 1].openForSubmissions = false;
            emit ChallengeClosed(challengeCounter - 1);
        }

        // add challenge to the mapping
        challenges[challengeCounter] = Challenge({
            openForSubmissions: true,
            expiredForRewarding: false,
            assertionId: _assertionId,
            assertionStateRootOrConfirmData: _confirmData,
            assertionTimestamp: _assertionTimestamp,
            challengerSignedHash: _challengerSignedHash,
            activeChallengerPublicKey: challengerPublicKey, // Store the active challengerPublicKey at the time of challenge submission
            rollupUsed: rollupAddress, // Store the rollup address used for this challenge
            createdTimestamp: block.timestamp,
            totalSupplyOfNodesAtChallengeStart: NodeLicense(nodeLicenseAddress).totalSupply(), // we need to store how many nodes were created for the 1% odds
            rewardAmountForClaimers: rewardAmountForClaimers,
            amountForGasSubsidy: amountForGasSubsidy,
            numberOfEligibleClaimers: 0,
            amountClaimedByClaimers: 0
        });

        // emit the events
        emit ChallengeSubmitted(challengeCounter);   

        // increment the challenge counter
        challengeCounter++;
    }

    /**
     * @notice A public view function to look up challenges.
     * @param _challengeId The ID of the challenge to look up.
     * @return The challenge corresponding to the given ID.
     */
    function getChallenge(uint256 _challengeId) public view returns (Challenge memory) {
        require(_challengeId < challengeCounter, "13");
        return challenges[_challengeId];
    }

    /**
     * @notice Submits an assertion to a challenge.
     * @dev This function can only be called by the owner of a NodeLicense or addresses they have approved on this contract.
     * @param _nodeLicenseId The ID of the NodeLicense.
     */
    function submitAssertionToChallenge(
        uint256 _nodeLicenseId,
        uint256 _challengeId,
        bytes memory _confirmData
    ) public {

        // Check the challenge is open for submissions
        require(challenges[_challengeId].openForSubmissions, "14");

        // If the submission successor hash, doesn't match the one submitted by the challenger, then end early and emit an event
        if (keccak256(abi.encodePacked(_confirmData)) != keccak256(abi.encodePacked(challenges[_challengeId].assertionStateRootOrConfirmData))) {
            emit InvalidSubmission(_challengeId, _nodeLicenseId);
            return;
        }

        address licenseOwner = NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId);
        address assignedPool = assignedKeyToPool[_nodeLicenseId];
        
        require(isValidOperator(licenseOwner, assignedPool), "17");
        // If the key is assigned to a pool
        if(assignedPool != address(0)) {
            // Check if the pool has not submitted for this challenge
            _submitNewPoolAssertion(assignedPool, _challengeId, _confirmData);
        } else {
            // Check that _nodeLicenseId hasn't already been submitted for this challenge
            require(!submissions[_challengeId][_nodeLicenseId].submitted, "15");
            // If the key is not assigned to a pool, then submit for the owner
            _submitAssertion(_nodeLicenseId, _challengeId, _confirmData, licenseOwner, assignedPool);
        }
    }

    /**
     * @notice Allows users to submit multiple assertions to a challenge for a batch of keys, or for a pool to submit for a batch of keys.
     * @dev This function was updated to be backwards compatible with the previous implementation, but the submitPoolAssertion function
     * @dev should be used by pools to submit for multiple keys for gas optimizations.
     * @dev This function can only be called by the owner of a NodeLicense, Pool Owner(s) or addresses they have approved on this contract.
     * @param _nodeLicenseIds The IDs of the NodeLicenses.
     * @param _challengeId The ID of the challenge.
     * @param _confirmData The confirm data of the assertion. This will change with implementation of BOLD 2
     */

	function submitMultipleAssertions(
		uint256[] memory _nodeLicenseIds,
		uint256 _challengeId,
		bytes memory _confirmData
	) external {    
        // Check the challenge is open for submissions
		require(challenges[_challengeId].openForSubmissions, "16");
        
        uint256 keyLength = _nodeLicenseIds.length;

        // If the submission successor hash, doesn't match the one submitted by the challenger, then end early and emit an event
		if (keccak256(abi.encodePacked(_confirmData)) != keccak256(abi.encodePacked(challenges[_challengeId].assertionStateRootOrConfirmData))) {
            emit InvalidBatchSubmission(_challengeId, msg.sender, keyLength);
			return;
		}

        // Loop through the keys and submit for each key
		for (uint256 i = 0; i < keyLength; i++) {
            uint256 _nodeLicenseId = _nodeLicenseIds[i];

            address licenseOwner = NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId);
            address assignedPool = assignedKeyToPool[_nodeLicenseId];

            // Check if the operator is the pool owner or a delegate
            if(isValidOperator(licenseOwner, assignedPool)){
                if(assignedPool != address(0)){
                    // If the key is assigned to a pool
                    // Only call _submitNewPoolAssertion if the submission does not exists so it won't throw an error and stop the submission for the other keys
                    if(!poolSubmissions[_challengeId][assignedPool].submitted) {
                        _submitNewPoolAssertion(assignedPool, _challengeId, _confirmData);
                    }
                }else {
                    // Check that _nodeLicenseId hasn't already been submitted for this challenge
                    if (!submissions[_challengeId][_nodeLicenseId].submitted) {
                        // If the key is not assigned to a pool  
                        _submitAssertion(_nodeLicenseId, _challengeId, _confirmData, licenseOwner, assignedPool);
                    }
                }
            }
		}
	}

    function isValidOperator(address licenseOwner, address assignedPool) internal view returns (bool) {
        return licenseOwner == msg.sender ||
            isApprovedForOperator(licenseOwner, msg.sender) ||
            (
                assignedPool != address(0) &&
                PoolFactory(poolFactoryAddress).isDelegateOfPoolOrOwner(msg.sender, assignedPool)
            );
    }
    
    function _submitAssertion(uint256 _nodeLicenseId, uint256 _challengeId, bytes memory _confirmData, address licenseOwner, address assignedPool) internal {
        // Support v1 (no pools) & v2 (pools)
		uint256 stakedAmount = getMaxStakedAmount(assignedPool, licenseOwner);

        // Check the user is actually eligible for receiving a reward, do not count them in numberOfEligibleClaimers if they are not able to receive a reward
        (bool hashEligible, ) = createAssertionHashAndCheckPayout(_nodeLicenseId, _challengeId, _getBoostFactor(stakedAmount), _confirmData, challenges[_challengeId].challengerSignedHash);

        // Store the assertionSubmission to a map
        submissions[_challengeId][_nodeLicenseId] = Submission({
            submitted: true,
            claimed: false,
            eligibleForPayout: hashEligible,
            nodeLicenseId: _nodeLicenseId,
            assertionStateRootOrConfirmData: _confirmData
        });

        // Keep track of how many submissions submitted were eligible for the reward
        if (hashEligible) {
            challenges[_challengeId].numberOfEligibleClaimers++;
        }

        // Emit the AssertionSubmitted event
        emit AssertionSubmitted(_challengeId, _nodeLicenseId);
        emit AssertionSubmittedV2(_challengeId, _nodeLicenseId, _confirmData, hashEligible);
    }

    function _validateChallengeIsClaimable(Challenge memory _challenge) internal pure{
        // Check the challenge exists by checking the timestamp is not 0
        require(_challenge.createdTimestamp != 0, "18");
        // Check if the challenge is closed for submissions
        require(!_challenge.openForSubmissions, "19");
    }   

    /**
     * @notice Claims a reward for a successful assertion.
     * @dev This function looks up the submission, checks if the challenge is closed for submissions, and if valid for a payout, sends a reward.
     * @param _nodeLicenseId The ID of the NodeLicense.
     * @param _challengeId The ID of the challenge.
     */
    function claimReward(
        uint256 _nodeLicenseId,
        uint256 _challengeId
    ) public {
        // Call the internal function to claim the reward
        uint256[] memory keyIds = new uint256[](1);
        keyIds[0] = _nodeLicenseId;
        claimMultipleRewards(keyIds, _challengeId, msg.sender);
    }

    function claimMultipleRewards(
		uint256[] memory _nodeLicenseIds,
		uint256 _challengeId,
        address claimForAddressInBatch
	) public {
        
        Challenge storage challengeToClaimFor = challenges[_challengeId];
        
        // Validate the challenge is claimable
        _validateChallengeIsClaimable(challengeToClaimFor);
        
        // expire the challenge if 270 days old
        bool expired = _checkChallengeRewardsExpired(_challengeId);

        // If the challenge has expired, end early
        if (expired) return;

        // Check if the challenge rewards have expired
        require(!challengeToClaimFor.expiredForRewarding, "27");

        uint256 reward = challengeToClaimFor.rewardAmountForClaimers / challengeToClaimFor.numberOfEligibleClaimers;
        uint256 keyLength = _nodeLicenseIds.length;
        uint256 claimCount = 0;
        uint256 poolMintAmount = 0;

		for (uint256 i = 0; i < keyLength; i++) {
            uint256 _nodeLicenseId = _nodeLicenseIds[i];

            uint256 mintTimestamp = NodeLicense(nodeLicenseAddress).getMintTimestamp(_nodeLicenseId);
            address owner = NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId);
            Submission storage submission = submissions[_challengeId][_nodeLicenseId];
            
            address rewardReceiver = assignedKeyToPool[_nodeLicenseId];
            if (rewardReceiver == address(0)) {
                rewardReceiver = owner;
            } else {
                //If assigned to pool try to claim pool submission
                _claimPoolSubmissionRewards(rewardReceiver, _challengeId);
            }

            // Check if the nodeLicenseId is eligible for a payout
            if (
                mintTimestamp < challengeToClaimFor.createdTimestamp && 
                !submission.claimed &&
                submission.eligibleForPayout
            ) {
                // mark the submission as claimed
                submission.claimed = true;

                // increment the amount claimed on the challenge
                challengeToClaimFor.amountClaimedByClaimers += reward;
                
                //If we have set the poolAddress we will only claim if the license is staked to that pool
                if (claimForAddressInBatch != address(0) && rewardReceiver == claimForAddressInBatch) {
                    poolMintAmount += reward;
                } else {
                    // Mint the reward to the owner of the nodeLicense
                    esXai(esXaiAddress).mint(rewardReceiver, reward);
                    _lifetimeClaims[rewardReceiver] += reward;
                }

                claimCount++;
                emit RewardsClaimed(_challengeId, reward);
                emit RewardsClaimedV2(_challengeId, _nodeLicenseId, reward);
            }
		}

        if (poolMintAmount > 0) {
            esXai(esXaiAddress).mint(claimForAddressInBatch, poolMintAmount);
            _lifetimeClaims[claimForAddressInBatch] += poolMintAmount;
        }
        
        _allocatedTokens -= claimCount * reward;
        emit BatchRewardsClaimed(_challengeId, claimCount * reward, claimCount);
	}

    /**
     * @notice Creates an assertion hash and determines if the hash payout is below the threshold.
     * @dev This function creates a hash of the _nodeLicenseId, _challengeId, challengerSignedHash from the challenge, and _newStateRoot.
     * It then converts the hash to a number and checks if it is below the threshold.
     * The threshold is calculated as the maximum uint256 value divided by 100 and then multiplied by the total supply of NodeLicenses.
     * @param _nodeLicenseId The ID of the NodeLicense.
     * @param _challengeId The ID of the challenge.
     * @param _boostFactor The factor controlling the chance of eligibility for payout as a multiplicator (base chance is 1/100 - Example: _boostFactor 200 will double the payout chance to 1/50, _boostFactor 16 maps to 1/6.25).
     * @param _confirmData The confirm hash, will change to assertionState after BOLD.
     * @param _challengerSignedHash The signed hash for the challenge
     * @return a boolean indicating if the hash is eligible, and the assertionHash.
     */
    function createAssertionHashAndCheckPayout(
        uint256 _nodeLicenseId,
        uint256 _challengeId,
        uint256 _boostFactor,
        bytes memory _confirmData,
        bytes memory _challengerSignedHash
    ) public view returns (bool, bytes32) {
        return RefereeCalculations(refereeCalculationsAddress).createAssertionHashAndCheckPayout(_nodeLicenseId, _challengeId, _boostFactor, _confirmData, _challengerSignedHash);
    }

    /**
     * @notice Returns the submissions for a given array of challenges and a NodeLicense.
     * @param _challengeIds An array of challenge IDs.
     * @param _nodeLicenseId The ID of the NodeLicense.
     * @return An array of submissions for the given challenges and NodeLicense.
     */
    function getSubmissionsForChallenges(uint256[] memory _challengeIds, uint256 _nodeLicenseId) public view returns (Submission[] memory) {
        Submission[] memory submissionsArray = new Submission[](_challengeIds.length);
        for (uint i = 0; i < _challengeIds.length; i++) {
            submissionsArray[i] = submissions[_challengeIds[i]][_nodeLicenseId];
        }
        return submissionsArray;
    }

    
    /**
     * @notice Expires the rewards for a challenge if it is at least 270 days old.
     * @param _challengeId The ID of the challenge.
     */
    function expireChallengeRewards(uint256 _challengeId) external {
        // check the challenge exists by checking the timestamp is not 0
        require(challenges[_challengeId].createdTimestamp != 0, "28");

        // Check if the challenge is at least 270 days old
        require(block.timestamp >= challenges[_challengeId].createdTimestamp + 270 days, "29");

        // Check the challenge isn't already expired
        require(challenges[_challengeId].expiredForRewarding == false, "30");

        // Remove the unclaimed tokens from the allocation
        _allocatedTokens -= challenges[_challengeId].rewardAmountForClaimers - challenges[_challengeId].amountClaimedByClaimers;

        // Set expiredForRewarding to true
        challenges[_challengeId].expiredForRewarding = true;

        // Emit the ChallengeExpired event
        emit ChallengeExpired(_challengeId);
    }

    /**
     * @dev Looks up payout boostFactor based on the staking tier.
     * @param stakedAmount The staked amount.
     * @return The payout chance boostFactor. 200 for double the chance.
     */
    function _getBoostFactor(uint256 stakedAmount) internal view returns (uint256) {
        if (stakedAmount < stakeAmountTierThresholds[0]) {
            return 100;
        }

        uint256 length = stakeAmountTierThresholds.length;
        for (uint256 tier = 1; tier < length; tier++) {
            if (stakedAmount < stakeAmountTierThresholds[tier]) {
                return stakeAmountBoostFactors[tier - 1];
            }
        }
        return stakeAmountBoostFactors[length - 1];
    }


    /**
     * @dev Looks up payout boostFactor based on the staking tier for a staker wallet.
     * @param staker The address of the staker or pool.
     * @return The payout chance boostFactor based on max stake capacity or staked amount.
     */
    function getBoostFactorForStaker(address staker) external view returns (uint256) {

        uint256 stakedAmount = stakedAmounts[staker];

        if(PoolFactory(poolFactoryAddress).poolsCreatedViaFactory(staker)){
			if (assignedKeysToPoolCount[staker] * maxStakeAmountPerLicense < stakedAmount) {
				stakedAmount = assignedKeysToPoolCount[staker] * maxStakeAmountPerLicense;
			}
        }else{			
			uint256 ownerUnstakedAmount = NodeLicense(nodeLicenseAddress).balanceOf(staker) - assignedKeysOfUserCount[staker];
			if (ownerUnstakedAmount * maxStakeAmountPerLicense < stakedAmount) {
				stakedAmount = ownerUnstakedAmount * maxStakeAmountPerLicense;
			}
        }

        return _getBoostFactor(stakedAmount);
    }

    /**
     * @dev Function that lets a user unstake V1 esXai that have previously been staked.
     * @param amount The amount of esXai to unstake.
     */
    function unstake(uint256 amount) external {
        require(stakedAmounts[msg.sender] >= amount, "41");
        esXai(esXaiAddress).transfer(msg.sender, amount);
        stakedAmounts[msg.sender] -= amount;
        emit UnstakeV1(msg.sender, amount, stakedAmounts[msg.sender]);
    }
    
    function stakeKeys(address pool, address staker, uint256[] memory keyIds, bool isAdminStake) external onlyPoolFactory {
        uint256 keysLength = keyIds.length;
        require(assignedKeysToPoolCount[pool] + keysLength <= maxKeysPerPool, "43");

        uint256 currentChallenge = challengeCounter - 1;

        NodeLicense nodeLicenseContract = NodeLicense(nodeLicenseAddress);
        for (uint256 i = 0; i < keysLength; i++) {
            uint256 keyId = keyIds[i];
            require(assignedKeyToPool[keyId] == address(0), "44");
            if(!isAdminStake){
                require(nodeLicenseContract.ownerOf(keyId) == staker, "45");
            }
            assignedKeyToPool[keyId] = pool;
            if(submissions[currentChallenge][keyId].submitted && submissions[currentChallenge][keyId].eligibleForPayout){
                submissions[currentChallenge][keyId].eligibleForPayout = false;
                challenges[currentChallenge].numberOfEligibleClaimers--;
                emit AssertionCancelled(currentChallenge, keyId);
            }
        }

        assignedKeysToPoolCount[pool] += keysLength;
        assignedKeysOfUserCount[staker] += keysLength;

        if(poolSubmissions[currentChallenge][pool].submitted){
            _updatePoolAssertion(pool, currentChallenge);
        }
    }

    function unstakeKeys(address pool, address staker, uint256[] memory keyIds) external onlyPoolFactory {
        uint256 keysLength = keyIds.length;
        NodeLicense nodeLicenseContract = NodeLicense(nodeLicenseAddress);

        for (uint256 i = 0; i < keysLength; i++) {
            uint256 keyId = keyIds[i];
            require(assignedKeyToPool[keyId] == pool, "47");
            require(nodeLicenseContract.ownerOf(keyId) == staker, "48");
            assignedKeyToPool[keyId] = address(0);
        }

        assignedKeysToPoolCount[pool] -= keysLength;
        assignedKeysOfUserCount[staker] -= keysLength;
        
        uint256 currentChallenge = challengeCounter - 1;
        if(poolSubmissions[currentChallenge][pool].submitted){
            _updatePoolAssertion(pool, currentChallenge);
        }
    }

    function stakeEsXai(address pool, uint256 amount) external onlyPoolFactory {
        uint256 maxStakedAmount = maxStakeAmountPerLicense * assignedKeysToPoolCount[pool];
        require(stakedAmounts[pool] + amount <= maxStakedAmount, "49");
        stakedAmounts[pool] += amount;
        
        uint256 currentChallenge = challengeCounter - 1;
        if(poolSubmissions[currentChallenge][pool].submitted){
            _updatePoolAssertion(pool, currentChallenge);
        }
    }

    function unstakeEsXai(address pool, uint256 amount) external onlyPoolFactory {
        require(stakedAmounts[pool] >= amount, "50");
        stakedAmounts[pool] -= amount;
        
        uint256 currentChallenge = challengeCounter - 1;
        if(poolSubmissions[currentChallenge][pool].submitted){
            _updatePoolAssertion(pool, currentChallenge);
        }
    }

    /**
     * @dev Admin function to enable or disable staking.
     * @param enabled The new staking status.
     */
    function setStakingEnabled(bool enabled) external {
        require(msg.sender == nodeLicenseAddress, "56");
        stakingEnabled = enabled;
        emit StakingEnabled(enabled);
    }

    /**
     * @notice Get winning key count for a pool submission.
     * @param stakedKeyCount The total number of keys staked in the pool.
     * @param boostFactor the boost factor of the pool
     * @param poolAddress used as parameter for randomization
     * @param challengeId used as parameter for radomization
     * @param _confirmData The confirm data of the assertion.
     * @param _challengerSignedHash The signed hash for the challenge
     * @return winningKeyCount The number of winning keys.
     */
    function getWinningKeyCount(uint256 stakedKeyCount, uint256 boostFactor, address poolAddress, uint256 challengeId, bytes memory _confirmData, bytes memory _challengerSignedHash) internal view returns (uint256) {
        return RefereeCalculations(refereeCalculationsAddress).getWinningKeyCount(stakedKeyCount, boostFactor, poolAddress, challengeId, _confirmData, _challengerSignedHash);
    }

    /**
    @notice Submit a New Pool assertion to a challenge.
    @dev This function is called internally from the submitMultipleAssertions function or submitPoolAssertion function.
    @param _poolAddress The address of the pool.
    @param _challengeId The ID of the challenge.
    @param _confirmData The confirm data of the assertion.
     */
	
    function _submitNewPoolAssertion(
		address _poolAddress,
		uint256 _challengeId,
		bytes memory _confirmData
	) internal {        
        
        // Add the number of keys staked in the pool to the total owner staked keys
        uint256 totalStakedKeys = assignedKeysToPoolCount[_poolAddress];

        // Get the stakedAmount of _poolAddress for determining boostFactor
		uint256 stakedAmount = getMaxStakedAmount(_poolAddress, address(0));

        // Determine the number of winning keys
        uint256 winningKeyCount = getWinningKeyCount(totalStakedKeys, _getBoostFactor(stakedAmount), _poolAddress, _challengeId, _confirmData, challenges[_challengeId].challengerSignedHash);

        // Update the challenge by adding the winning key count to the total winning keys
        challenges[_challengeId].numberOfEligibleClaimers += winningKeyCount;

        // Store the pool submission struct
        poolSubmissions[_challengeId][_poolAddress] = PoolSubmission({
            submitted: true,
            claimed: false,
            stakedKeyCount: totalStakedKeys,
            winningKeyCount: winningKeyCount,
            assertionStateRootOrConfirmData: _confirmData
        });

        // Emit the New Pool Submission event
        emit NewPoolSubmission(_challengeId, _poolAddress, totalStakedKeys, winningKeyCount);
	}

    /**
    * @notice Update Previously Submitted Pool assertion to a challenge.
    * @dev This function is called internally from the submitMultipleAssertions function or submitPoolAssertion function.
    * @param _poolAddress The address of the pool.
    * @param _challengeId The ID of the challenge.
    *
     */
	function _updatePoolAssertion(
		address _poolAddress,
		uint256 _challengeId
	) internal {
        
        // Add the number of keys staked in the pool to the total owner staked keys
        uint256 totalStakedKeys = assignedKeysToPoolCount[_poolAddress];

        // Get the stakedAmount of _poolAddress for determining boostFactor
		uint256 stakedAmount = getMaxStakedAmount(_poolAddress, address(0));

        // Determine the number of winning keys
        uint256 winningKeyCount = getWinningKeyCount(totalStakedKeys, _getBoostFactor(stakedAmount),_poolAddress, _challengeId, poolSubmissions[_challengeId][_poolAddress].assertionStateRootOrConfirmData, challenges[_challengeId].challengerSignedHash);

        uint256 prevWinningCount = poolSubmissions[_challengeId][_poolAddress].winningKeyCount;

        // Determine the winning key count increase or decrease amounts
        uint256 winningKeysIncreaseAmount = 0;
        uint256 winningKeysDecreaseAmount = 0;

        // If winning key count has increased, add the difference to the total number of eligible claimers
        if(winningKeyCount > prevWinningCount){
            // Determine the increase amount
            winningKeysIncreaseAmount = winningKeyCount - prevWinningCount;
            // Update the challenge by adding the increase amount to the total number of eligible claimers
            challenges[_challengeId].numberOfEligibleClaimers += winningKeysIncreaseAmount;

        // Else winning key count has decreased, subtract the difference from the total number of eligible claimers
        } else {
            // Determine the decrease amount
            winningKeysDecreaseAmount = prevWinningCount - winningKeyCount;
            // Update the challenge by subtracting the decrease amount from the total number of eligible claimers
            challenges[_challengeId].numberOfEligibleClaimers -= winningKeysDecreaseAmount;

        }

        // Store the updated pool submission data to the struct
        poolSubmissions[_challengeId][_poolAddress].stakedKeyCount = totalStakedKeys;
        poolSubmissions[_challengeId][_poolAddress].winningKeyCount = winningKeyCount;

        // Emit the Updated Pool Submission event
        emit UpdatePoolSubmission(_challengeId, _poolAddress, totalStakedKeys, winningKeyCount, winningKeysIncreaseAmount, winningKeysDecreaseAmount);	
	}

    /** @notice Claim Pool Rewards
    * @dev This function is called internally from the claimMultipleRewards function or claimPoolRewards function.
    * @param _poolAddress The address of the pool.
    * @param _challengeId The ID of the challenge.
    */

    function _claimPoolSubmissionRewards(address _poolAddress, uint256 _challengeId) internal {
        Challenge memory challengeToClaimFor  = challenges[_challengeId];
        
        // expire the challenge if 270 days old
        bool expired = _checkChallengeRewardsExpired(_challengeId);

        // If the challenge has expired, end early
        if (expired) return;

        PoolSubmission storage poolSubmission = poolSubmissions[_challengeId][_poolAddress];

        // Check if the pool is elegible for a payout
        if (poolSubmission.submitted && !poolSubmission.claimed && poolSubmission.winningKeyCount > 0) {

            uint256 reward = challengeToClaimFor.rewardAmountForClaimers / challengeToClaimFor.numberOfEligibleClaimers;
            uint256 poolMintAmount = 0;

            // Calculate the amount to mint to the pool
            poolMintAmount = (reward * poolSubmission.winningKeyCount);     

            // mark the submission as claimed
            poolSubmission.claimed = true;

            // increment the amount claimed on the challenge
            challenges[_challengeId].amountClaimedByClaimers += poolMintAmount;    
		
            esXai(esXaiAddress).mint(_poolAddress, poolMintAmount);

            // Increment the total claims of this address
            _lifetimeClaims[_poolAddress] += poolMintAmount;

            // unallocate the tokens that have now been converted to esXai
            _allocatedTokens -= poolMintAmount;

            emit PoolRewardsClaimed(_challengeId, _poolAddress, poolMintAmount, poolSubmission.winningKeyCount);
        }
    }

    /** 
    * @notice Function to check if challenge rewards are expired
    * @dev This function is called internally from the claimReward function.
    * @param _challengeId The ID of the challenge.
    * @return A boolean indicating if the challenge rewards are expired.
    */

    function _checkChallengeRewardsExpired(uint256 _challengeId) internal returns (bool) {
        // Check if the challenge rewards have expired
        bool expired = block.timestamp >= challenges[_challengeId].createdTimestamp + 270 days;

        // If the challenge rewards have expired and the mapping has
        // not been updated, then update the mapping
        if(expired && !challenges[_challengeId].expiredForRewarding){            
            // Remove the unclaimed tokens from the allocation
            _allocatedTokens -= challenges[_challengeId].rewardAmountForClaimers - challenges[_challengeId].amountClaimedByClaimers;

            // Set expiredForRewarding to true
            challenges[_challengeId].expiredForRewarding = true;

            // Emit the ChallengeExpired event
            emit ChallengeExpired(_challengeId);
        }else {
            // If challenge has expired and mapping has been updated, then revert
            require(!expired, "20");
            return false;
        }

        return expired;
    }

    /** 
    * @notice Submit Pool Assertion external function
    * @dev this function is called by the pool owner, or an approved operator, to submit a pool assertion to a challenge.
    * @param _poolAddress The address of the pool.
    * @param _challengeId The ID of the challenge.
    * @param _confirmData The confirm data of the assertion.
    */
    function submitPoolAssertion(address _poolAddress, uint256 _challengeId, bytes memory _confirmData) external {
        // Confirm the challenge is open for submissions
		require(challenges[_challengeId].openForSubmissions, "16");

        // Check if the submission successor hash, doesn't match the one submitted by the challenger, then end early and emit an event
		if (keccak256(abi.encodePacked(_confirmData)) != keccak256(abi.encodePacked(challenges[_challengeId].assertionStateRootOrConfirmData))) {
            emit InvalidBatchSubmission(_challengeId, msg.sender, assignedKeysToPoolCount[_poolAddress]);
			return;
		}

        require(PoolFactory2(poolFactoryAddress).validateSubmitPoolAssertion(_poolAddress, msg.sender), "17");

        // Confirm not already submitted
        require(!poolSubmissions[_challengeId][_poolAddress].submitted, "54");
        _submitNewPoolAssertion(_poolAddress, _challengeId, _confirmData);
    }

    /**
    * @notice Claim Pool Submission Rewards external function
    * @dev this function is called by the pool owner, or an approved operator, to claim rewards for a pool submission.
    * @param _poolAddress The address of the pool.
    * @param _challengeId The ID of the challenge.
    */
    function claimPoolSubmissionRewards(address _poolAddress, uint256 _challengeId) external {
        // Validate the challenge is claimable
        _validateChallengeIsClaimable(challenges[_challengeId]);

        _claimPoolSubmissionRewards(_poolAddress, _challengeId);
    }

    /**
    * @notice Get the maximum available stake amount, the lower of the actual stake amount and the maximum capacity amount
    * @dev this will check the pool or the owners V1 stake
    * @param assignedPool The address of the assigned pool, can be address(0) for keys that are not assigned.
    * @param licenseOwner The key owner for V1 stake, can be address(0) if the key is assigned to a pool.
    */
    function getMaxStakedAmount(address assignedPool, address licenseOwner) internal view returns (uint256 stakedAmount) {      
		stakedAmount = stakedAmounts[assignedPool];
		if (assignedPool == address(0)) {
			stakedAmount = stakedAmounts[licenseOwner];
			uint256 ownerUnstakedAmount = NodeLicense(nodeLicenseAddress).balanceOf(licenseOwner) - assignedKeysOfUserCount[licenseOwner];
			if (ownerUnstakedAmount * maxStakeAmountPerLicense < stakedAmount) {
				stakedAmount = ownerUnstakedAmount * maxStakeAmountPerLicense;
			}
		} else { 
			if (assignedKeysToPoolCount[assignedPool] * maxStakeAmountPerLicense < stakedAmount) {
				stakedAmount = assignedKeysToPoolCount[assignedPool] * maxStakeAmountPerLicense;
			}
		}
    }
}