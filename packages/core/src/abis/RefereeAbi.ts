export const RefereeAbi = [
  {
    "type": "event",
    "anonymous": false,
    "name": "Approval",
    "inputs": [
      {
        "type": "address",
        "name": "owner",
        "indexed": true
      },
      {
        "type": "address",
        "name": "operator",
        "indexed": true
      },
      {
        "type": "bool",
        "name": "approved",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "AssertionCheckingToggled",
    "inputs": [
      {
        "type": "bool",
        "name": "newState",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "AssertionSubmitted",
    "inputs": [
      {
        "type": "uint256",
        "name": "challengeId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "nodeLicenseId",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ChallengeClosed",
    "inputs": [
      {
        "type": "uint256",
        "name": "challengeNumber",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ChallengeExpired",
    "inputs": [
      {
        "type": "uint256",
        "name": "challengeId",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ChallengeSubmitted",
    "inputs": [
      {
        "type": "uint256",
        "name": "challengeNumber",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ChallengerPublicKeyChanged",
    "inputs": [
      {
        "type": "bytes",
        "name": "newChallengerPublicKey",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "Initialized",
    "inputs": [
      {
        "type": "uint8",
        "name": "version",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "InvalidSubmission",
    "inputs": [
      {
        "type": "uint256",
        "name": "challengeId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "nodeLicenseId",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "KycStatusChanged",
    "inputs": [
      {
        "type": "address",
        "name": "wallet",
        "indexed": true
      },
      {
        "type": "bool",
        "name": "isKycApproved",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "NodeLicenseAddressChanged",
    "inputs": [
      {
        "type": "address",
        "name": "newNodeLicenseAddress",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RewardsClaimed",
    "inputs": [
      {
        "type": "uint256",
        "name": "challengeId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleAdminChanged",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "bytes32",
        "name": "previousAdminRole",
        "indexed": true
      },
      {
        "type": "bytes32",
        "name": "newAdminRole",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleGranted",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "address",
        "name": "account",
        "indexed": true
      },
      {
        "type": "address",
        "name": "sender",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleRevoked",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "address",
        "name": "account",
        "indexed": true
      },
      {
        "type": "address",
        "name": "sender",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RollupAddressChanged",
    "inputs": [
      {
        "type": "address",
        "name": "newRollupAddress",
        "indexed": false
      }
    ]
  },
  {
    "type": "function",
    "name": "CHALLENGER_ROLE",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "DEFAULT_ADMIN_ROLE",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "KYC_ADMIN_ROLE",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "addKycWallet",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "wallet"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "calculateChallengeEmissionAndTier",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      },
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "challengeCounter",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "challengerPublicKey",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bytes",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "challenges",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": "openForSubmissions"
      },
      {
        "type": "bool",
        "name": "expiredForRewarding"
      },
      {
        "type": "uint64",
        "name": "assertionId"
      },
      {
        "type": "bytes32",
        "name": "assertionStateRootOrConfirmData"
      },
      {
        "type": "uint64",
        "name": "assertionTimestamp"
      },
      {
        "type": "bytes",
        "name": "challengerSignedHash"
      },
      {
        "type": "bytes",
        "name": "activeChallengerPublicKey"
      },
      {
        "type": "address",
        "name": "rollupUsed"
      },
      {
        "type": "uint256",
        "name": "createdTimestamp"
      },
      {
        "type": "uint256",
        "name": "totalSupplyOfNodesAtChallengeStart"
      },
      {
        "type": "uint256",
        "name": "rewardAmountForClaimers"
      },
      {
        "type": "uint256",
        "name": "amountForGasSubsidy"
      },
      {
        "type": "uint256",
        "name": "numberOfEligibleClaimers"
      },
      {
        "type": "uint256",
        "name": "amountClaimedByClaimers"
      }
    ]
  },
  {
    "type": "function",
    "name": "claimReward",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_nodeLicenseId"
      },
      {
        "type": "uint256",
        "name": "_challengeId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "createAssertionHashAndCheckPayout",
    "constant": true,
    "stateMutability": "pure",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_nodeLicenseId"
      },
      {
        "type": "uint256",
        "name": "_challengeId"
      },
      {
        "type": "bytes",
        "name": "_confirmData"
      },
      {
        "type": "bytes",
        "name": "_challengerSignedHash"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      },
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "esXaiAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "expireChallengeRewards",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_challengeId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "gasSubsidyRecipient",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getChallenge",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_challengeId"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "name": "",
        "components": [
          {
            "type": "bool",
            "name": "openForSubmissions"
          },
          {
            "type": "bool",
            "name": "expiredForRewarding"
          },
          {
            "type": "uint64",
            "name": "assertionId"
          },
          {
            "type": "bytes32",
            "name": "assertionStateRootOrConfirmData"
          },
          {
            "type": "uint64",
            "name": "assertionTimestamp"
          },
          {
            "type": "bytes",
            "name": "challengerSignedHash"
          },
          {
            "type": "bytes",
            "name": "activeChallengerPublicKey"
          },
          {
            "type": "address",
            "name": "rollupUsed"
          },
          {
            "type": "uint256",
            "name": "createdTimestamp"
          },
          {
            "type": "uint256",
            "name": "totalSupplyOfNodesAtChallengeStart"
          },
          {
            "type": "uint256",
            "name": "rewardAmountForClaimers"
          },
          {
            "type": "uint256",
            "name": "amountForGasSubsidy"
          },
          {
            "type": "uint256",
            "name": "numberOfEligibleClaimers"
          },
          {
            "type": "uint256",
            "name": "amountClaimedByClaimers"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getCombinedTotalSupply",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getKycWalletAtIndex",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "index"
      }
    ],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getKycWalletCount",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getOperatorAtIndex",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      },
      {
        "type": "uint256",
        "name": "index"
      }
    ],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getOperatorCount",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getOwnerCountForOperator",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "operator"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getOwnerForOperatorAtIndex",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "operator"
      },
      {
        "type": "uint256",
        "name": "index"
      }
    ],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getRoleAdmin",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      }
    ],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getRoleMember",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "uint256",
        "name": "index"
      }
    ],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getRoleMemberCount",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getSubmissionsForChallenges",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256[]",
        "name": "_challengeIds"
      },
      {
        "type": "uint256",
        "name": "_nodeLicenseId"
      }
    ],
    "outputs": [
      {
        "type": "tuple[]",
        "name": "",
        "components": [
          {
            "type": "bool",
            "name": "submitted"
          },
          {
            "type": "bool",
            "name": "claimed"
          },
          {
            "type": "bool",
            "name": "eligibleForPayout"
          },
          {
            "type": "uint256",
            "name": "nodeLicenseId"
          },
          {
            "type": "bytes",
            "name": "assertionStateRootOrConfirmData"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getTotalClaims",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "grantRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "hasRole",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "initialize",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_esXaiAddress"
      },
      {
        "type": "address",
        "name": "_xaiAddress"
      },
      {
        "type": "address",
        "name": "_gasSubsidyAddress"
      },
      {
        "type": "uint256",
        "name": "gasSubsidyPercentage_"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "isApprovedForOperator",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      },
      {
        "type": "address",
        "name": "operator"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "isCheckingAssertions",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "isKycApproved",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "wallet"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "nodeLicenseAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "removeKycWallet",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "wallet"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "renounceRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "revokeRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "rollupAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "rollupAssertionTracker",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "setApprovalForOperator",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "operator"
      },
      {
        "type": "bool",
        "name": "approved"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setChallengerPublicKey",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes",
        "name": "_challengerPublicKey"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setNodeLicenseAddress",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_nodeLicenseAddress"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setRollupAddress",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_rollupAddress"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "submissions",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": ""
      },
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": "submitted"
      },
      {
        "type": "bool",
        "name": "claimed"
      },
      {
        "type": "bool",
        "name": "eligibleForPayout"
      },
      {
        "type": "uint256",
        "name": "nodeLicenseId"
      },
      {
        "type": "bytes",
        "name": "assertionStateRootOrConfirmData"
      }
    ]
  },
  {
    "type": "function",
    "name": "submitAssertionToChallenge",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_nodeLicenseId"
      },
      {
        "type": "uint256",
        "name": "_challengeId"
      },
      {
        "type": "bytes",
        "name": "_confirmData"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "submitChallenge",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint64",
        "name": "_assertionId"
      },
      {
        "type": "uint64",
        "name": "_predecessorAssertionId"
      },
      {
        "type": "bytes32",
        "name": "_confirmData"
      },
      {
        "type": "uint64",
        "name": "_assertionTimestamp"
      },
      {
        "type": "bytes",
        "name": "_challengerSignedHash"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes4",
        "name": "interfaceId"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "toggleAssertionChecking",
    "constant": false,
    "payable": false,
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "xaiAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  }
];