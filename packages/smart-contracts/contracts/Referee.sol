pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./nitro-contracts/rollup/IRollupCore.sol";

contract Referee is AccessControlEnumerable {

    // Define roles
    bytes32 public constant CHALLENGER_ROLE = keccak256("CHALLENGER_ROLE");

    // The Challenger's public key of their registered BLS-Pair
    bytes public challengerPublicKey;

    // the address of the rollup, so we can get assertions
    address public rollupAddress;

    // Counter for the challenges
    uint256 public challengeCounter = 0;

    // mapping to store all of the challenges
    mapping(uint256 => Challenge) public challenges;

    struct Challenge {
        uint64 assertionId;
        uint64 predecessorAssertionId;
        bytes32 assertionStateRoot;
        uint64 assertionTimestamp; // equal to the block number the assertion was made on in the rollup protocol
        bytes challengerSignedHash;
        bytes activeChallengerPublicKey; // The challengerPublicKey that was active at the time of challenge submission
        address rollupUsed; // The rollup address used for this challenge
    }

    // Define events
    event ChallengeSubmitted(uint256 indexed challengeNumber, Challenge challenge);
    event RollupAddressChanged(address newRollupAddress);
    event ChallengerPublicKeyChanged(bytes newChallengerPublicKey);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(CHALLENGER_ROLE, DEFAULT_ADMIN_ROLE);
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

        // get the node information from the rollup.
        Node memory node = IRollupCore(rollupAddress).getNode(_assertionId);

        // verify the data inside the hash matched the data pulled from the rollup contract
        require(node.prevNum == _predecessorAssertionId, "The _predecessorAssertionId is incorrect.");
        require(node.stateHash == _assertionStateRoot, "The _assertionStateRoot is incorrect.");
        require(node.createdAtBlock == _assertionTimestamp, "The _assertionTimestamp did not match the block this assertion was created at.");

        // increment the challenge counter
        challengeCounter++;

        // add challenge to the mapping
        challenges[challengeCounter] = Challenge({
            assertionId: _assertionId,
            predecessorAssertionId: _predecessorAssertionId,
            assertionStateRoot: _assertionStateRoot,
            assertionTimestamp: _assertionTimestamp,
            challengerSignedHash: _challengerSignedHash,
            activeChallengerPublicKey: challengerPublicKey, // Store the active challengerPublicKey at the time of challenge submission
            rollupUsed: rollupAddress // Store the rollup address used for this challenge
        });

        // emit the event
        emit ChallengeSubmitted(challengeCounter, challenges[challengeCounter]);
    }

    /**
     * @notice A public view function to look up challenges.
     * @param _challengeId The ID of the challenge to look up.
     * @return The challenge corresponding to the given ID.
     */
    function getChallenge(uint64 _challengeId) public view returns (Challenge memory) {
        return challenges[_challengeId];
    }
    
}


