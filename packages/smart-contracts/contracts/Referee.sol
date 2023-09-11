pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@arbitrum/nitro-contracts/src/rollup/RollupUserLogic.sol";

contract Referee {
    using ECDSA for bytes32;

    // The Challenger's public key of their registered BLS-Pair
    bytes public challengerPublicKey;

    // the address of the rollup, so we can get assertions
    address public rollupUserLogic;

    struct Claim {
        address watchtower;
        bytes32 assertionId;
        bytes32 challenge;
        uint256 timestamp;
    }

    mapping(bytes32 => Claim) public claims;

    // Define events
    event ChallengeSubmitted(bytes32 indexed assertionId, bytes32 indexed predecessorAssertionId, bytes32 stateRoot, uint256 timestamp, bytes signature);
    event ClaimRegistered(address indexed watchtower, bytes32 indexed assertionId, bytes32 challenge);
    event ClaimRedeemed(address indexed watchtower, bytes32 indexed assertionId, bytes32 challenge, uint256 timestamp, bytes32 successorAssertionId)

    constructor(bytes _challengerPublicKey, address _rollUpUserLogic) {
        challengerPublicKey = _challengerPublicKey;
        rollupUserLogic = _rollUpUserLogic;
    }

    function submitChallenge(
        bytes32 _assertionId,
        bytes32 _predecessorAssertionId,
        bytes32 _stateRoot,
        bytes32 _timestamp,
        bytes _signature
    ) public {

        // check an assertion hasn't already been submitted for this ID
        // TODO

        // create a hash of the challenge
        bytes32 challengeHash = keccak256(abi.encodePacked(_assertionId, _predecessorAssertionId, _stateRoot, _timestamp));

        // Verify the signature
        require(
            verifyChallengerSignature(challengeHash, _signature),
            "Invalid signature"
        );

        // get the node information from the rollup
        RollupUserLogic.Node memory node = RollupUserLogic(rollupUserLogic).getNodeStorage(_assertionId);

        // verify the challengeHash is valid
        require(node.prevNum == _predecessorAssertionId, "The _predecessorAssertionId is incorrect.");
        require(node.stateHash == _stateRoot, "The _stateRoot is incorrect.");
        require(node.createdAtBlock == _timestamp, "The _timestamp did not match the block this assertion was created at.");

        // Register the claim
        registerClaim(msg.sender, _assertionId, challengeHash);

        // Emit the event
        emit ChallengeSubmitted(_assertionId, _predecessorAssertionId, _stateRoot, _timestamp, _signature);
    }

    function registerClaim(
        address _watchtower,
        bytes32 _assertionId,
        bytes32 _challenge
    ) public {
        Claim memory newClaim = Claim({
            watchtower: _watchtower,
            assertionId: _assertionId,
            challenge: _challenge,
            timestamp: block.timestamp
        });

        claims[_assertionId] = newClaim;

        // Emit the event
        emit ClaimRegistered(_watchtower, _assertionId, _challenge);
    }

    function redeemClaim(
        address _watchtower,
        bytes32 _assertionId,
        bytes32 _challenge,
        uint256 _timestamp,
        bytes32 _successorAssertionId
    ) public {
        Claim memory claim = claims[_assertionId];

        require(claim.watchtower == _watchtower, "Invalid watchtower");
        require(claim.challenge == _challenge, "Invalid challenge");
        require(claim.timestamp < _timestamp, "Invalid timestamp");

        // Add your logic here to verify the successor assertion and pay the reward

        // Emit the event
        emit ClaimRedeemed(_watchtower, _assertionId, _challenge, _timestamp, _successorAssertionId);
    }

    function verifySignature(bytes32 hash, bytes memory signature) public view returns (bool) {
        return hash.toEthSignedMessageHash().recover(signature) == address(uint160(uint256(keccak256(challengerPublicKey))));
    }

    function hashClaim(Claim memory _claim) returns (memory bytes) {
        
    }
}

