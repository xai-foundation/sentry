// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library RefereeEvents {
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
}
