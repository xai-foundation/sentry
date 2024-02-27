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

contract Referee2 is Initializable, AccessControlEnumerableUpgradeable {
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
    mapping (address => uint256) private _lifetimeClaims;

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

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[495] private __gap;

    // Struct for the submissions
    struct Submission {
        bool submitted;
        bool claimed;
        bool eligibleForPayout;
        uint256 nodeLicenseId;
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

    // Define events
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
    event RewardsClaimed(uint256 indexed challengeId, uint256 amount);
    event ChallengeExpired(uint256 indexed challengeId);
    event StakingEnabled();
    event UpdateMaxStakeAmount(uint256 prevAmount, uint256 newAmount);
    event StakedV1(address indexed user, uint256 amount, uint256 totalStaked);
    event UnstakeV1(address indexed user, uint256 amount, uint256 totalStaked);

    function initialize () public reinitializer(2) {
        maxStakeAmountPerLicense = 25000 * 10 ** 18;

        stakeAmountTierThresholds.push(1_000 * 10 ** 18);
        stakeAmountTierThresholds.push(10_000 * 10 ** 18);
        stakeAmountTierThresholds.push(100_000 * 10 ** 18);
        stakeAmountTierThresholds.push(1_000_000 * 10 ** 18);

        stakeAmountBoostFactors.push(2);
        stakeAmountBoostFactors.push(4);
        stakeAmountBoostFactors.push(8);
        stakeAmountBoostFactors.push(16);
    }

    /**
     * @notice Returns the combined total supply of esXai Xai, and the unminted allocated tokens.
     * @dev This function fetches the total supply of esXai, Xai, and unminted allocated tokens and returns their sum.
     * @return uint256 The combined total supply of esXai, Xai, and the unminted allocated tokens.
     */
    function getCombinedTotalSupply() public view returns (uint256) {
        return  esXai(esXaiAddress).totalSupply() + Xai(xaiAddress).totalSupply() + _allocatedTokens;
    }

    /**
     * @notice Toggles the assertion checking.
     */
    function toggleAssertionChecking() external onlyRole(DEFAULT_ADMIN_ROLE) {
        isCheckingAssertions = !isCheckingAssertions;
        emit AssertionCheckingToggled(isCheckingAssertions);
    }

    /**
     * @notice Sets the challengerPublicKey.
     * @param _challengerPublicKey The public key of the challenger.
     */
    function setChallengerPublicKey(bytes memory _challengerPublicKey) external onlyRole(DEFAULT_ADMIN_ROLE) {
        challengerPublicKey = _challengerPublicKey;
        emit ChallengerPublicKeyChanged(_challengerPublicKey);
    }

    /**
     * @notice Sets the rollupAddress.
     * @param _rollupAddress The address of the rollup.
     */
    function setRollupAddress(address _rollupAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rollupAddress = _rollupAddress;
        emit RollupAddressChanged(_rollupAddress);
    }

    /**
     * @notice Sets the nodeLicenseAddress.
     * @param _nodeLicenseAddress The address of the NodeLicense NFT.
     */
    function setNodeLicenseAddress(address _nodeLicenseAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        nodeLicenseAddress = _nodeLicenseAddress;
        emit NodeLicenseAddressChanged(_nodeLicenseAddress);
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
        require(index < getOperatorCount(owner), "Index out of bounds");
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
        require(index < _ownersForOperator[operator].length(), "Index out of bounds");
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
        require(index < getKycWalletCount(), "Index out of bounds");
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
        require(maxSupply > totalSupply, "There are no more tiers, we are too close to the end");

        uint256 tier = Math.log2(maxSupply / (maxSupply - totalSupply)); // calculate which tier we are in starting from 0
        require(tier < 23, "There are no more accurate tiers");

        uint256 emissionTier = maxSupply / (2**(tier + 1)); // equal to the amount of tokens that are emitted during this tier

        // determine what the size of the emission is based on each challenge having an estimated static length
        return (emissionTier / 17520, emissionTier);
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
        require(rollupAddress != address(0), "Rollup address must be set before submitting a challenge");

        // check the challengerPublicKey is set
        require(challengerPublicKey.length != 0, "Challenger public key must be set before submitting a challenge");

        // check the assertionId and rollupAddress combo haven't been submitted yet
        bytes32 comboHash = keccak256(abi.encodePacked(_assertionId, rollupAddress));
        require(!rollupAssertionTracker[comboHash], "This assertionId and rollupAddress combo has already been submitted");
        rollupAssertionTracker[comboHash] = true;

        // verify the data inside the hash matched the data pulled from the rollup contract
        if (isCheckingAssertions) {

            // get the node information from the rollup.
            Node memory node = IRollupCore(rollupAddress).getNode(_assertionId);

            require(node.prevNum == _predecessorAssertionId, "The _predecessorAssertionId is incorrect.");
            require(node.confirmData == _confirmData, "The _confirmData is incorrect.");
            require(node.createdAtBlock == _assertionTimestamp, "The _assertionTimestamp did not match the block this assertion was created at.");
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
        require(_challengeId < challengeCounter, "challenge with this id, has not been created.");
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
        address licenseOwner = NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId);
        require(
            licenseOwner == msg.sender ||
            isApprovedForOperator(licenseOwner, msg.sender),
            "Caller must be the owner of the NodeLicense or an approved operator"
        );

        // Check the challenge is open for submissions
        require(challenges[_challengeId].openForSubmissions, "Challenge is not open for submissions");
        
        // Check that _nodeLicenseId hasn't already been submitted for this challenge
        require(!submissions[_challengeId][_nodeLicenseId].submitted, "_nodeLicenseId has already been submitted for this challenge");

        // If the submission successor hash, doesn't match the one submitted by the challenger, then end early and emit an event
        if (keccak256(abi.encodePacked(_confirmData)) != keccak256(abi.encodePacked(challenges[_challengeId].assertionStateRootOrConfirmData))) {
            emit InvalidSubmission(_challengeId, _nodeLicenseId);
            return;
        }

        // Check the user is actually eligible for receiving a reward, do not count them in numberOfEligibleClaimers if they are not able to receive a reward
        (bool hashEligible, ) = createAssertionHashAndCheckPayout(_nodeLicenseId, _challengeId, _getBoostFactor(stakedAmounts[licenseOwner]), _confirmData, challenges[_challengeId].challengerSignedHash);

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

        Challenge memory challangeToClaimFor  = challenges[_challengeId];

        // check the challenge exists by checking the timestamp is not 0
        require(challangeToClaimFor.createdTimestamp != 0, "The Challenge does not exist for this id");

        // Check if the challenge is closed for submissions
        require(!challangeToClaimFor.openForSubmissions, "Challenge is still open for submissions");

        // expire the challenge if 180 days old
        if (block.timestamp >= challangeToClaimFor.createdTimestamp + 180 days) {
            expireChallengeRewards(_challengeId);
            return;
        }
        
        // Check if the challenge rewards have expired
        require(!challangeToClaimFor.expiredForRewarding, "Challenge rewards have expired");

        // SAVE GAS REMOVE - this is not needed anymore, we know that licenses have been minted
        // // Check that node licenses could even be eligible at the start
        // require(challangeToClaimFor.totalSupplyOfNodesAtChallengeStart > 0, "No NodeLicenses have been minted when this challenge started");

        // Get the minting timestamp of the nodeLicenseId
        uint256 mintTimestamp = NodeLicense(nodeLicenseAddress).getMintTimestamp(_nodeLicenseId);

        // Check if the nodeLicenseId is eligible for a payout
        require(mintTimestamp < challangeToClaimFor.createdTimestamp, "NodeLicense is not eligible for a payout on this challenge, it was minted after it started");

        // Look up the submission
        Submission memory submission = submissions[_challengeId][_nodeLicenseId];
        
        // SAVE GAS REMOVE - we already check if the submission is eligibleForPayout
        // require(submission.submitted, "No submission found for this NodeLicense and challenge");

        // Check if the owner of the NodeLicense is KYC'd
        address owner = NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId);
        require(isKycApproved(owner), "Owner of the NodeLicense is not KYC'd");

        // Check if the submission has already been claimed
        require(!submission.claimed, "This submission has already been claimed");

         // SAVE GAS REMOVE - Already checked on submit, we should not have to check again - the staked amount could be different!
        // uint256 _boostFactor = getBoostFactor(stakedAmounts[owner]);
        // // Check if we are valid for a payout
        // (bool hashEligible, ) = createAssertionHashAndCheckPayout(_nodeLicenseId, _challengeId, _boostFactor, submission.assertionStateRootOrConfirmData, challenges[_challengeId].challengerSignedHash);
        // require(hashEligible, "Not valid for a payout");
        require(submission.eligibleForPayout, "Not valid for a payout");

        // Take the amount that was allocated for the rewards and divide it by the number of claimers
        uint256 reward = challangeToClaimFor.rewardAmountForClaimers / challangeToClaimFor.numberOfEligibleClaimers;

        // mark the submission as claimed
        submissions[_challengeId][_nodeLicenseId].claimed = true;

        // increment the amount claimed on the challenge
        challenges[_challengeId].amountClaimedByClaimers += reward;

        // Mint the reward to the owner of the nodeLicense
        esXai(esXaiAddress).mint(owner, reward);

        // Emit the RewardsClaimed event
        emit RewardsClaimed(_challengeId, reward);

        // Increment the total claims of this address
        _lifetimeClaims[owner] += reward;

        // unallocate the tokens that have now been converted to esXai
        _allocatedTokens -= reward;
    }

    /**
     * @notice Creates an assertion hash and determines if the hash payout is below the threshold.
     * @dev This function creates a hash of the _nodeLicenseId, _challengeId, challengerSignedHash from the challenge, and _newStateRoot.
     * It then converts the hash to a number and checks if it is below the threshold.
     * The threshold is calculated as the maximum uint256 value divided by 100 and then multiplied by the total supply of NodeLicenses.
     * @param _nodeLicenseId The ID of the NodeLicense.
     * @param _challengeId The ID of the challenge.
     * @param _boostFactor The factor controlling the chance of eligibility for payout as a multiplicator (base chance is 1/100 - Example: _boostFactor 2 will double the payout chance to 1/50, _boostFactor 16 maps to 1/6.25).
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
    ) public pure returns (bool, bytes32) {

        bytes32 assertionHash = keccak256(abi.encodePacked(_nodeLicenseId, _challengeId, _confirmData, _challengerSignedHash));
        uint256 hashNumber = uint256(assertionHash);
        return (hashNumber % 100 < _boostFactor, assertionHash);
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
     * @notice Expires the rewards for a challenge if it is at least 180 days old.
     * @param _challengeId The ID of the challenge.
     */
    function expireChallengeRewards(uint256 _challengeId) public {
        // check the challenge exists by checking the timestamp is not 0
        require(challenges[_challengeId].createdTimestamp != 0, "The Challenge does not exist for this id");

        // Check if the challenge is at least 180 days old
        require(block.timestamp >= challenges[_challengeId].createdTimestamp + 180 days, "Challenge is not old enough to expire rewards");

        // Check the challenge isn't already expired
        require(challenges[_challengeId].expiredForRewarding == false, "The challenge is already expired");

        // Remove the unclaimed tokens from the allocation
        _allocatedTokens -= challenges[_challengeId].rewardAmountForClaimers - challenges[_challengeId].amountClaimedByClaimers;

        // Set expiredForRewarding to true
        challenges[_challengeId].expiredForRewarding = true;

        // Emit the ChallengeExpired event
        emit ChallengeExpired(_challengeId);
    }

    /**
     * @notice Get the total claims for a specific address.
     * @param owner The address to query.
     * @return The total claims for the address.
     */
    function getTotalClaims(address owner) public view returns (uint256) {
        return _lifetimeClaims[owner];
    }

    /**
     * @dev Looks up payout boostFactor based on the staking tier.
     * @param stakedAmount The staked amount.
     * @return The payout chance boostFactor. 200 for double the chance.
     */
    function _getBoostFactor(uint256 stakedAmount) internal view returns (uint256) {
        if(stakedAmount < stakeAmountTierThresholds[0]){
            return 1;
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
     * @notice Enables staking on the Referee.
     */
    function enableStaking() external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakingEnabled = true;
        emit StakingEnabled();
    }
    
    /**
     * @dev Admin update the maximum staking amount per NodeLicense
     * @param newAmount The new maximum amount per NodeLicense
     */
    function updateMaxStakePerLicense(uint256 newAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAmount != 0, "Invalid max amount");
        uint256 prevAmount = maxStakeAmountPerLicense;
        maxStakeAmountPerLicense = newAmount;
        emit UpdateMaxStakeAmount(prevAmount, newAmount);
    }

    /**
     * @dev Admin update the tier thresholds and the corresponding reward chance boost
     * @param index The index if the tier to update
     * @param newThreshold The new threshold of the tier
     * @param newBoostFactor The new boost factor for the tier
     */
    function updateStakingTier(uint256 index, uint256 newThreshold, uint256 newBoostFactor) external onlyRole(DEFAULT_ADMIN_ROLE) {

        require(newBoostFactor > 0 && newBoostFactor <= 100, "Invalid boost factor");

        uint256 lastIndex = stakeAmountTierThresholds.length - 1;
        if(index == 0){
            require(stakeAmountTierThresholds[1] > newThreshold, "Threshold needs to be monotonically increasing");
        } else if(index == lastIndex){
            require(stakeAmountTierThresholds[lastIndex - 1] < newThreshold, "Threshold needs to be monotonically increasing");
        } else {
            require(stakeAmountTierThresholds[index + 1] > newThreshold && stakeAmountTierThresholds[index - 1] < newThreshold, "Threshold needs to be monotonically increasing");
        }

        stakeAmountTierThresholds[index] = newThreshold;
        stakeAmountBoostFactors[index] = newBoostFactor;
    }

    /**
     * @dev Admin add a new staking tier to the end of the tier array
     * @param newThreshold The new threshold of the tier
     * @param newBoostFactor The new boost factor for the tier
     */
    function addStakingTier(uint256 newThreshold, uint256 newBoostFactor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newBoostFactor > 0 && newBoostFactor <= 100, "Invalid boost factor");

        uint256 lastIndex = stakeAmountTierThresholds.length - 1;
        require(stakeAmountTierThresholds[lastIndex] < newThreshold, "Threshold needs to be monotonically increasing");

        stakeAmountTierThresholds.push(newThreshold);
        stakeAmountBoostFactors.push(newBoostFactor);
    }

    /**
     * @dev Admin remove a staking tier
     * @param index The index if the tier to remove
     */
    function removeStakingTier(uint256 index) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(stakeAmountTierThresholds.length > 1, "Cannot remove last tier");
        require(index < stakeAmountTierThresholds.length, "Index out of bound");
        for (uint i = index; i < stakeAmountTierThresholds.length - 1; i++) {
            stakeAmountTierThresholds[i] = stakeAmountTierThresholds[i + 1];
            stakeAmountBoostFactors[i] = stakeAmountBoostFactors[i + 1];
        }
        stakeAmountTierThresholds.pop();
        stakeAmountBoostFactors.pop();
    }

    /**
     * @dev Looks up maximum allowed staking amount of esXai based on number of NodeLicenses.
     * @param numLicenses The number of NodeLicenses of the owner.
     * @return The maximum allowed staking amount of esXai.
     */
    function _getMaxStakeAmount(uint256 numLicenses) internal view returns (uint256) {
        return maxStakeAmountPerLicense * numLicenses;
    }
    
    /**
     * @dev Looks up payout boostFactor based on the staking tier.
     * @param stakedAmount The staked amount.
     * @return The payout chance boostFactor. 2 for double the chance.
     */
    function getBoostFactor(uint256 stakedAmount) external view returns (uint256) {
        return _getBoostFactor(stakedAmount);
    }

    /**
     * @dev Looks up payout boostFactor based on the staking tier for a specific license key.
     * @param _nodeLicenseId The Node License Key Id.
     * @return The payout chance boostFactor.
     */
    function getBoostFactorForKeyId(uint256 _nodeLicenseId) external view returns (uint256) {
        address licenseOwner = NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId);
        return _getBoostFactor(stakedAmounts[licenseOwner]);
    }

    /**
     * @dev Looks up payout boostFactor based on the staking tier for a staker wallet.
     * @param staker The address of the staker or pool.
     * @return The payout chance boostFactor.
     */
    function getBoostFactorForStaker(address staker) external view returns (uint256) {
        return _getBoostFactor(stakedAmounts[staker]);
    }

    /**
     * @dev Looks up maximum allowed staking amount of esXai based on number of NodeLicenses.
     * @param numLicenses The number of NodeLicenses of the owner.
     * @return The maximum allowed staking amount of esXai.
     */
    function getMaxStakeAmount(uint256 numLicenses) external view returns (uint256) {
        return _getMaxStakeAmount(numLicenses);
    }

    /**
     * @dev Function that lets a user stake esXai.
     * @param amount The amount of esXai to stake.
     */
    function stake(uint256 amount) external {
        require(stakingEnabled, "Staking not enabled");
        // Check how many NodeLicenses owner has.
        uint256 numLicenses = NodeLicense(nodeLicenseAddress).balanceOf(msg.sender);

        // Check maximum amount based on numLicenses.
        uint256 maxStakedAmount = _getMaxStakeAmount(numLicenses);
        require(stakedAmounts[msg.sender] + amount <= maxStakedAmount, "Maximum staking amount exceeded");

        esXai(esXaiAddress).transferFrom(msg.sender, address(this), amount);
        stakedAmounts[msg.sender] += amount;
        emit StakedV1(msg.sender, amount, stakedAmounts[msg.sender]);
    }

    /**
     * @dev Function that lets a user unstake esXai that have previously been staked.
     * @param amount The amount of esXai to unstake.
     */
    function unstake(uint256 amount) external {
        require(stakedAmounts[msg.sender] >= amount, "Insufficient amount staked");
        esXai(esXaiAddress).transfer(msg.sender, amount);
        stakedAmounts[msg.sender] -= amount;
        emit UnstakeV1(msg.sender, amount, stakedAmounts[msg.sender]);
    }
}