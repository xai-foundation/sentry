export const RefereeAbi = [
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
          }
      ],
      "name": "Approval",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "nodeLicenseId",
              "type": "uint256"
          }
      ],
      "name": "AssertionCancelled",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "bool",
              "name": "newState",
              "type": "bool"
          }
      ],
      "name": "AssertionCheckingToggled",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "nodeLicenseId",
              "type": "uint256"
          }
      ],
      "name": "AssertionSubmitted",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "nodeLicenseId",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "bytes",
              "name": "assertionStateRootOrConfirmData",
              "type": "bytes"
          }
      ],
      "name": "AssertionSubmittedV2",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalReward",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "keysLength",
              "type": "uint256"
          }
      ],
      "name": "BatchRewardsClaimed",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeNumber",
              "type": "uint256"
          }
      ],
      "name": "ChallengeClosed",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          }
      ],
      "name": "ChallengeExpired",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeNumber",
              "type": "uint256"
          }
      ],
      "name": "ChallengeSubmitted",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "bytes",
              "name": "newChallengerPublicKey",
              "type": "bytes"
          }
      ],
      "name": "ChallengerPublicKeyChanged",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "uint8",
              "name": "version",
              "type": "uint8"
          }
      ],
      "name": "Initialized",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "address",
              "name": "operator",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "keysLength",
              "type": "uint256"
          }
      ],
      "name": "InvalidBatchSubmission",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "nodeLicenseId",
              "type": "uint256"
          }
      ],
      "name": "InvalidSubmission",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "wallet",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "bool",
              "name": "isKycApproved",
              "type": "bool"
          }
      ],
      "name": "KycStatusChanged",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "poolAddress",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "stakedKeys",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "winningKeys",
              "type": "uint256"
          }
      ],
      "name": "NewPoolSubmission",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "address",
              "name": "newNodeLicenseAddress",
              "type": "address"
          }
      ],
      "name": "NodeLicenseAddressChanged",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "poolAddress",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalReward",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "winningKeys",
              "type": "uint256"
          }
      ],
      "name": "PoolRewardsClaimed",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          }
      ],
      "name": "RewardsClaimed",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "nodeLicenseId",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          }
      ],
      "name": "RewardsClaimedV2",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          },
          {
              "indexed": true,
              "internalType": "bytes32",
              "name": "previousAdminRole",
              "type": "bytes32"
          },
          {
              "indexed": true,
              "internalType": "bytes32",
              "name": "newAdminRole",
              "type": "bytes32"
          }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address"
          }
      ],
      "name": "RoleGranted",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address"
          }
      ],
      "name": "RoleRevoked",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "address",
              "name": "newRollupAddress",
              "type": "address"
          }
      ],
      "name": "RollupAddressChanged",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalStaked",
              "type": "uint256"
          }
      ],
      "name": "StakedV1",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
          }
      ],
      "name": "StakingEnabled",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalStaked",
              "type": "uint256"
          }
      ],
      "name": "UnstakeV1",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "prevAmount",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "newAmount",
              "type": "uint256"
          }
      ],
      "name": "UpdateMaxKeysPerPool",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "prevAmount",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "newAmount",
              "type": "uint256"
          }
      ],
      "name": "UpdateMaxStakeAmount",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "challengeId",
              "type": "uint256"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "poolAddress",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "stakedKeys",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "winningKeys",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "increase",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "decrease",
              "type": "uint256"
          }
      ],
      "name": "UpdatePoolSubmission",
      "type": "event"
  },
  {
      "inputs": [],
      "name": "CHALLENGER_ROLE",
      "outputs": [
          {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
          {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "KYC_ADMIN_ROLE",
      "outputs": [
          {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "name": "_lifetimeClaims",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "wallet",
              "type": "address"
          }
      ],
      "name": "addKycWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "assignedKeyToPool",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "name": "assignedKeysOfUserCount",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "name": "assignedKeysToPoolCount",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "calculateChallengeEmissionAndTier",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "challengeCounter",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "challengerPublicKey",
      "outputs": [
          {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "challenges",
      "outputs": [
          {
              "internalType": "bool",
              "name": "openForSubmissions",
              "type": "bool"
          },
          {
              "internalType": "bool",
              "name": "expiredForRewarding",
              "type": "bool"
          },
          {
              "internalType": "uint64",
              "name": "assertionId",
              "type": "uint64"
          },
          {
              "internalType": "bytes32",
              "name": "assertionStateRootOrConfirmData",
              "type": "bytes32"
          },
          {
              "internalType": "uint64",
              "name": "assertionTimestamp",
              "type": "uint64"
          },
          {
              "internalType": "bytes",
              "name": "challengerSignedHash",
              "type": "bytes"
          },
          {
              "internalType": "bytes",
              "name": "activeChallengerPublicKey",
              "type": "bytes"
          },
          {
              "internalType": "address",
              "name": "rollupUsed",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "totalSupplyOfNodesAtChallengeStart",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "rewardAmountForClaimers",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "amountForGasSubsidy",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "numberOfEligibleClaimers",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "amountClaimedByClaimers",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256[]",
              "name": "_nodeLicenseIds",
              "type": "uint256[]"
          },
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          },
          {
              "internalType": "address",
              "name": "claimForAddressInBatch",
              "type": "address"
          }
      ],
      "name": "claimMultipleRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_poolAddress",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          }
      ],
      "name": "claimPoolSubmissionRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_nodeLicenseId",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_nodeLicenseId",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_boostFactor",
              "type": "uint256"
          },
          {
              "internalType": "bytes",
              "name": "_confirmData",
              "type": "bytes"
          },
          {
              "internalType": "bytes",
              "name": "_challengerSignedHash",
              "type": "bytes"
          }
      ],
      "name": "createAssertionHashAndCheckPayout",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          },
          {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "esXaiAddress",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          }
      ],
      "name": "expireChallengeRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "gasSubsidyRecipient",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "staker",
              "type": "address"
          }
      ],
      "name": "getBoostFactorForStaker",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          }
      ],
      "name": "getChallenge",
      "outputs": [
          {
              "components": [
                  {
                      "internalType": "bool",
                      "name": "openForSubmissions",
                      "type": "bool"
                  },
                  {
                      "internalType": "bool",
                      "name": "expiredForRewarding",
                      "type": "bool"
                  },
                  {
                      "internalType": "uint64",
                      "name": "assertionId",
                      "type": "uint64"
                  },
                  {
                      "internalType": "bytes32",
                      "name": "assertionStateRootOrConfirmData",
                      "type": "bytes32"
                  },
                  {
                      "internalType": "uint64",
                      "name": "assertionTimestamp",
                      "type": "uint64"
                  },
                  {
                      "internalType": "bytes",
                      "name": "challengerSignedHash",
                      "type": "bytes"
                  },
                  {
                      "internalType": "bytes",
                      "name": "activeChallengerPublicKey",
                      "type": "bytes"
                  },
                  {
                      "internalType": "address",
                      "name": "rollupUsed",
                      "type": "address"
                  },
                  {
                      "internalType": "uint256",
                      "name": "createdTimestamp",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "totalSupplyOfNodesAtChallengeStart",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "rewardAmountForClaimers",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "amountForGasSubsidy",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "numberOfEligibleClaimers",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "amountClaimedByClaimers",
                      "type": "uint256"
                  }
              ],
              "internalType": "struct Referee16.Challenge",
              "name": "",
              "type": "tuple"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "getCombinedTotalSupply",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
          }
      ],
      "name": "getKycWalletAtIndex",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "getKycWalletCount",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
          }
      ],
      "name": "getOperatorAtIndex",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          }
      ],
      "name": "getOperatorCount",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "operator",
              "type": "address"
          }
      ],
      "name": "getOwnerCountForOperator",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "operator",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
          }
      ],
      "name": "getOwnerForOperatorAtIndex",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          }
      ],
      "name": "getRoleAdmin",
      "outputs": [
          {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          },
          {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
          }
      ],
      "name": "getRoleMember",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          }
      ],
      "name": "getRoleMemberCount",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256[]",
              "name": "_challengeIds",
              "type": "uint256[]"
          },
          {
              "internalType": "uint256",
              "name": "_nodeLicenseId",
              "type": "uint256"
          }
      ],
      "name": "getSubmissionsForChallenges",
      "outputs": [
          {
              "components": [
                  {
                      "internalType": "bool",
                      "name": "submitted",
                      "type": "bool"
                  },
                  {
                      "internalType": "bool",
                      "name": "claimed",
                      "type": "bool"
                  },
                  {
                      "internalType": "bool",
                      "name": "eligibleForPayout",
                      "type": "bool"
                  },
                  {
                      "internalType": "uint256",
                      "name": "nodeLicenseId",
                      "type": "uint256"
                  },
                  {
                      "internalType": "bytes",
                      "name": "assertionStateRootOrConfirmData",
                      "type": "bytes"
                  }
              ],
              "internalType": "struct Referee16.Submission[]",
              "name": "",
              "type": "tuple[]"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          },
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          },
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "hasRole",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_refereeCalculationsAddress",
              "type": "address"
          }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "operator",
              "type": "address"
          }
      ],
      "name": "isApprovedForOperator",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "isCheckingAssertions",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "wallet",
              "type": "address"
          }
      ],
      "name": "isKycApproved",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "maxKeysPerPool",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "maxStakeAmountPerLicense",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "nodeLicenseAddress",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "poolFactoryAddress",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          },
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "name": "poolSubmissions",
      "outputs": [
          {
              "internalType": "bool",
              "name": "submitted",
              "type": "bool"
          },
          {
              "internalType": "bool",
              "name": "claimed",
              "type": "bool"
          },
          {
              "internalType": "uint256",
              "name": "stakedKeyCount",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "winningKeyCount",
              "type": "uint256"
          },
          {
              "internalType": "bytes",
              "name": "assertionStateRootOrConfirmData",
              "type": "bytes"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "refereeCalculationsAddress",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "wallet",
              "type": "address"
          }
      ],
      "name": "removeKycWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          },
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
          },
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "rollupAddress",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
          }
      ],
      "name": "rollupAssertionTracker",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "operator",
              "type": "address"
          },
          {
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
          }
      ],
      "name": "setApprovalForOperator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
          }
      ],
      "name": "setStakingEnabled",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "stakeAmountBoostFactors",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "stakeAmountTierThresholds",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "pool",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          }
      ],
      "name": "stakeEsXai",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "pool",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "staker",
              "type": "address"
          },
          {
              "internalType": "uint256[]",
              "name": "keyIds",
              "type": "uint256[]"
          },
          {
              "internalType": "bool",
              "name": "isAdminStake",
              "type": "bool"
          }
      ],
      "name": "stakeKeys",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "name": "stakedAmounts",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "stakingEnabled",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "submissions",
      "outputs": [
          {
              "internalType": "bool",
              "name": "submitted",
              "type": "bool"
          },
          {
              "internalType": "bool",
              "name": "claimed",
              "type": "bool"
          },
          {
              "internalType": "bool",
              "name": "eligibleForPayout",
              "type": "bool"
          },
          {
              "internalType": "uint256",
              "name": "nodeLicenseId",
              "type": "uint256"
          },
          {
              "internalType": "bytes",
              "name": "assertionStateRootOrConfirmData",
              "type": "bytes"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_nodeLicenseId",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          },
          {
              "internalType": "bytes",
              "name": "_confirmData",
              "type": "bytes"
          }
      ],
      "name": "submitAssertionToChallenge",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint64",
              "name": "_assertionId",
              "type": "uint64"
          },
          {
              "internalType": "uint64",
              "name": "_predecessorAssertionId",
              "type": "uint64"
          },
          {
              "internalType": "bytes32",
              "name": "_confirmData",
              "type": "bytes32"
          },
          {
              "internalType": "uint64",
              "name": "_assertionTimestamp",
              "type": "uint64"
          },
          {
              "internalType": "bytes",
              "name": "_challengerSignedHash",
              "type": "bytes"
          }
      ],
      "name": "submitChallenge",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256[]",
              "name": "_nodeLicenseIds",
              "type": "uint256[]"
          },
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          },
          {
              "internalType": "bytes",
              "name": "_confirmData",
              "type": "bytes"
          }
      ],
      "name": "submitMultipleAssertions",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_poolAddress",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "_challengeId",
              "type": "uint256"
          },
          {
              "internalType": "bytes",
              "name": "_confirmData",
              "type": "bytes"
          }
      ],
      "name": "submitPoolAssertion",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
          }
      ],
      "name": "supportsInterface",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          }
      ],
      "name": "unstake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "pool",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          }
      ],
      "name": "unstakeEsXai",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "pool",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "staker",
              "type": "address"
          },
          {
              "internalType": "uint256[]",
              "name": "keyIds",
              "type": "uint256[]"
          }
      ],
      "name": "unstakeKeys",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "xaiAddress",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  }
];