pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./nitro-contracts/rollup/IRollupCore.sol";
import "./NodeLicense.sol";
import "./Xai.sol";
import "./esXai.sol";

contract Referee is Initializable, AccessControlEnumerableUpgradeable {
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

    // Mapping to track rollup assertions (combination of the assertionId and the rollupAddress used, because we allow switching the rollupAddress, and can't assume assertionIds are unique.)
    mapping (bytes32 => bool) public rollupAssertionTracker;

    // Mapping to track KYC'd wallets
    EnumerableSetUpgradeable.AddressSet private kycWallets;

    // Emissions Schedule determining how much should be emitted each challenge
    uint256[] public emissionSchedule;

    // Struct for the submissions
    struct Submission {
        bool submitted;
        uint256 nodeLicenseId;
        bytes successorStateRoot;
    }

    // Struct for the challenges
    struct Challenge {
        bool openForSubmissions; // when the next challenge is submitted for the following assertion, this will be closed.
        uint64 assertionId;
        uint64 predecessorAssertionId;
        bytes32 assertionStateRoot;
        uint64 assertionTimestamp; // equal to the block number the assertion was made on in the rollup protocol
        bytes challengerSignedHash;
        bytes activeChallengerPublicKey; // The challengerPublicKey that was active at the time of challenge submission
        address rollupUsed; // The rollup address used for this challenge
        uint256 createdTimestamp; // used to determine if a node license is eligible to submit
        uint256 totalSupplyAtChallengeStart; // keep track of what the total supply is when the challenge starts
    }

    // Define events
    event ChallengeSubmitted(uint256 indexed challengeNumber, Challenge challenge);
    event AssertionSubmitted(uint256 indexed challengeId, uint256 indexed nodeLicenseId);
    event RollupAddressChanged(address newRollupAddress);
    event ChallengerPublicKeyChanged(bytes newChallengerPublicKey);
    event NodeLicenseAddressChanged(address newNodeLicenseAddress);
    event AssertionCheckingToggled(bool newState);
    event Approval(address indexed owner, address indexed operator, bool approved);
    event KycStatusChanged(address indexed wallet, bool isKycApproved);

    function initialize(address _esXaiAddress, address _xaiAddress) public initializer {
        __AccessControlEnumerable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(CHALLENGER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(KYC_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);

        // Set the esXai and xai addresses
        esXaiAddress = _esXaiAddress;
        xaiAddress = _xaiAddress;
    }

    /**
     * @notice Returns the combined total supply of esXai and Xai.
     * @dev This function fetches the total supply of esXai and Xai tokens and returns their sum.
     * @return uint256 The combined total supply of esXai and Xai.
     */
    function getCombinedTotalSupply() public view returns (uint256) {
        uint256 esXaiSupply = esXai(esXaiAddress).totalSupply();
        uint256 xaiSupply = Xai(xaiAddress).totalSupply();
        return esXaiSupply + xaiSupply;
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
     * @notice Submits a challenge to the contract.
     * @dev This function verifies the caller is the challenger, checks if an assertion hasn't already been submitted for this ID,
     * gets the node information from the rollup, verifies the data inside the hash matched the data pulled from the rollup contract,
     * adds the challenge to the mapping, and emits the ChallengeSubmitted event.
     * @param _assertionId The ID of the assertion.
     * @param _predecessorAssertionId The ID of the predecessor assertion.
     * @param _assertionStateRoot The state root of the assertion.
     * @param _assertionTimestamp The timestamp of the assertion.
     * @param _challengerSignedHash The signed hash from the challenger.
     */
    function submitChallenge(
        uint64 _assertionId,
        uint64 _predecessorAssertionId,
        bytes32 _assertionStateRoot,
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
            require(node.stateHash == _assertionStateRoot, "The _assertionStateRoot is incorrect.");
            require(node.createdAtBlock == _assertionTimestamp, "The _assertionTimestamp did not match the block this assertion was created at.");
        }

        // add challenge to the mapping
        challenges[challengeCounter] = Challenge({
            openForSubmissions: true,
            assertionId: _assertionId,
            predecessorAssertionId: _predecessorAssertionId,
            assertionStateRoot: _assertionStateRoot,
            assertionTimestamp: _assertionTimestamp,
            challengerSignedHash: _challengerSignedHash,
            activeChallengerPublicKey: challengerPublicKey, // Store the active challengerPublicKey at the time of challenge submission
            rollupUsed: rollupAddress, // Store the rollup address used for this challenge
            createdTimestamp: block.timestamp,
            totalSupplyAtChallengeStart: NodeLicense(nodeLicenseAddress).totalSupply()
        });

        // increment the challenge counter
        challengeCounter++;

        // emit the event
        emit ChallengeSubmitted(challengeCounter, challenges[challengeCounter]);
    }

    /**
     * @notice A public view function to look up challenges.
     * @param _challengeId The ID of the challenge to look up.
     * @return The challenge corresponding to the given ID.
     */
    function getChallenge(uint64 _challengeId) public view returns (Challenge memory) {
        require(_challengeId < challengeCounter, "challenge with this id, has not been created.");
        return challenges[_challengeId];
    }

    /**
     * @notice Get the challenge at a given index.
     * @param index The index of the challenge to query.
     * @return The challenge corresponding to the given index.
     */
    function getChallengeAtIndex(uint256 index) public view returns (Challenge memory) {
        require(index <= challengeCounter, "Index out of bounds");
        return challenges[index];
    }

    /**
     * @notice Submits an assertion to a challenge.
     * @dev This function can only be called by the owner of a NodeLicense or addresses they have approved on this contract.
     * @param _nodeLicenseId The ID of the NodeLicense.
     */
    function submitAssertionToChallenge(
        uint256 _nodeLicenseId,
        uint256 _challengeId,
        bytes memory _successorStateRoot
    ) public {
        require(
            isApprovedForOperator(NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId), msg.sender) || NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId) == msg.sender,
            "Caller must be the owner of the NodeLicense or an approved operator"
        );

        // Check the challenge is open for submissions
        require(challenges[_challengeId].openForSubmissions, "Challenge is not open for submissions");
        
        // Check that _nodeLicenseId hasn't already been submitted for this challenge
        require(!submissions[_challengeId][_nodeLicenseId].submitted, "_nodeLicenseId has already been submitted for this challenge");

        // Store the assertionSubmission to a map
        submissions[_challengeId][_nodeLicenseId] = Submission({
            submitted: true,
            nodeLicenseId: _nodeLicenseId,
            successorStateRoot: _successorStateRoot
        });

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
        // Look up the submission
        Submission memory submission = submissions[_challengeId][_nodeLicenseId];
        require(submission.submitted, "No submission found for this NodeLicense and challenge");

        // Check if the challenge is closed for submissions
        Challenge memory challenge = challenges[_challengeId];
        require(!challenge.openForSubmissions, "Challenge is still open for submissions");

        // Check if the owner of the NodeLicense is KYC'd
        address owner = NodeLicense(nodeLicenseAddress).ownerOf(_nodeLicenseId);
        require(isKycApproved(owner), "Owner of the NodeLicense is not KYC'd");

        // Check if we are valid for a payout
        (bool isBelowThreshold, , ) = createAssertionHashAndCheckPayout(_nodeLicenseId, _challengeId, submission.successorStateRoot);
        require(isBelowThreshold, "Not valid for a payout");

        // TODO: Send a reward
    }

    /**
     * @notice Creates an assertion hash and determines if the hash payout is below the threshold.
     * @dev This function creates a hash of the _nodeLicenseId, _challengeId, challengerSignedHash from the challenge, and _newStateRoot.
     * It then converts the hash to a number and checks if it is below the threshold.
     * The threshold is calculated as the maximum uint256 value divided by 100 and then multiplied by the total supply of NodeLicenses.
     * @param _nodeLicenseId The ID of the NodeLicense.
     * @param _challengeId The ID of the challenge.
     * @param _successorStateRoot The successor state root.
     * @return A tuple containing a boolean indicating if the hash is below the threshold, the assertionHash, and the threshold.
     */
    function createAssertionHashAndCheckPayout(
        uint256 _nodeLicenseId,
        uint256 _challengeId,
        bytes memory _successorStateRoot
    ) public view returns (bool, bytes32, uint256) {
        bytes memory _challengerSignedHash = challenges[_challengeId].challengerSignedHash;
        bytes32 assertionHash = keccak256(abi.encodePacked(_nodeLicenseId, _challengeId, _challengerSignedHash, _successorStateRoot));
        uint256 hashNumber = uint256(assertionHash);
        uint256 totalSupply = challenges[_challengeId].totalSupplyAtChallengeStart;
        require(challenges[_challengeId].totalSupplyAtChallengeStart > 0, "No NodeLicenses have been minted when this challenge started");
        uint256 threshold = (type(uint256).max / 100) * challenges[_challengeId].totalSupplyAtChallengeStart;

        // Get the minting timestamp of the nodeLicenseId
        uint256 mintTimestamp = NodeLicense(nodeLicenseAddress).getMintTimestamp(_nodeLicenseId);

        // Check if the nodeLicenseId is eligible for a payout
        require(mintTimestamp < challenges[_challengeId].createdTimestamp, "NodeLicense is not eligible for a payout on this challenge, it was minted after it started");

        return (hashNumber < threshold, assertionHash, threshold);
    }

    /**
     * @notice Returns the submission for a given challenge and NodeLicense.
     * @param _challengeId The ID of the challenge.
     * @param _nodeLicenseId The ID of the NodeLicense.
     * @return The submission for the given challenge and NodeLicense.
     */
    function getSubmissionForChallenge(uint256 _challengeId, uint256 _nodeLicenseId) public view returns (Submission memory) {
        return submissions[_challengeId][_nodeLicenseId];
    }
}