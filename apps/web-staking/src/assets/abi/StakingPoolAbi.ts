export const StakingPoolAbi = [
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
	  "name": "POOL_ADMIN",
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
	  "name": "claimRewards",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "createUnstakeEsXaiRequest",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
		},
		{
		  "type": "uint256",
		  "name": "amount"
		},
		{
		  "type": "uint256",
		  "name": "period"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "createUnstakeKeyRequest",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
		},
		{
		  "type": "uint256",
		  "name": "keyAmount"
		},
		{
		  "type": "uint256",
		  "name": "period"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "createUnstakeOwnerLastKeyRequest",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "owner"
		},
		{
		  "type": "uint256",
		  "name": "period"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "delegateOwner",
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
	  "name": "description",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [],
	  "outputs": [
		{
		  "type": "string",
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
	  "name": "esXaiStakeBucket",
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
	  "name": "getDelegateOwner",
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
	  "name": "getPoolInfo",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [],
	  "outputs": [
		{
		  "type": "tuple",
		  "name": "baseInfo",
		  "components": [
			{
			  "type": "address",
			  "name": "poolAddress"
			},
			{
			  "type": "address",
			  "name": "owner"
			},
			{
			  "type": "address",
			  "name": "keyBucketTracker"
			},
			{
			  "type": "address",
			  "name": "esXaiBucketTracker"
			},
			{
			  "type": "uint256",
			  "name": "keyCount"
			},
			{
			  "type": "uint256",
			  "name": "totalStakedAmount"
			},
			{
			  "type": "uint256",
			  "name": "updateSharesTimestamp"
			},
			{
			  "type": "uint32",
			  "name": "ownerShare"
			},
			{
			  "type": "uint32",
			  "name": "keyBucketShare"
			},
			{
			  "type": "uint32",
			  "name": "stakedBucketShare"
			}
		  ]
		},
		{
		  "type": "string",
		  "name": "_name"
		},
		{
		  "type": "string",
		  "name": "_description"
		},
		{
		  "type": "string",
		  "name": "_logo"
		},
		{
		  "type": "string[]",
		  "name": "_socials"
		},
		{
		  "type": "uint32[]",
		  "name": "_pendingShares"
		},
		{
		  "type": "uint256",
		  "name": "_ownerStakedKeys"
		},
		{
		  "type": "uint256",
		  "name": "_ownerRequestedUnstakeKeyAmount"
		},
		{
		  "type": "uint256",
		  "name": "_ownerLatestUnstakeRequestLockTime"
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "getPoolOwner",
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
	  "name": "getStakedAmounts",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
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
	  "name": "getStakedKeys",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [],
	  "outputs": [
		{
		  "type": "uint256[]",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "getStakedKeysCount",
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
	  "name": "getStakedKeysCountForUser",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
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
	  "name": "getUndistributedClaimAmount",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
		}
	  ],
	  "outputs": [
		{
		  "type": "uint256",
		  "name": "claimAmountFromKeys"
		},
		{
		  "type": "uint256",
		  "name": "claimAmountFromEsXai"
		},
		{
		  "type": "uint256",
		  "name": "claimAmount"
		},
		{
		  "type": "uint256",
		  "name": "ownerAmount"
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "getUnstakeRequest",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "account"
		},
		{
		  "type": "uint256",
		  "name": "index"
		}
	  ],
	  "outputs": [
		{
		  "type": "tuple",
		  "name": "",
		  "components": [
			{
			  "type": "bool",
			  "name": "open"
			},
			{
			  "type": "bool",
			  "name": "isKeyRequest"
			},
			{
			  "type": "uint256",
			  "name": "amount"
			},
			{
			  "type": "uint256",
			  "name": "lockTime"
			},
			{
			  "type": "uint256",
			  "name": "completeTime"
			},
			{
			  "type": "uint256[5]",
			  "name": "__gap"
			}
		  ]
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "getUnstakeRequestCount",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "account"
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
	  "name": "getUserPoolData",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
		}
	  ],
	  "outputs": [
		{
		  "type": "uint256",
		  "name": "userStakedEsXaiAmount"
		},
		{
		  "type": "uint256",
		  "name": "userClaimAmount"
		},
		{
		  "type": "uint256[]",
		  "name": "userStakedKeyIds"
		},
		{
		  "type": "uint256",
		  "name": "unstakeRequestkeyAmount"
		},
		{
		  "type": "uint256",
		  "name": "unstakeRequestesXaiAmount"
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "getUserRequestedUnstakeAmounts",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
		}
	  ],
	  "outputs": [
		{
		  "type": "uint256",
		  "name": "keyAmount"
		},
		{
		  "type": "uint256",
		  "name": "esXaiAmount"
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
	  "name": "initShares",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "uint32",
		  "name": "_ownerShare"
		},
		{
		  "type": "uint32",
		  "name": "_keyBucketShare"
		},
		{
		  "type": "uint32",
		  "name": "_stakedBucketShare"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "initialize",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "_refereeAddress"
		},
		{
		  "type": "address",
		  "name": "_esXaiAddress"
		},
		{
		  "type": "address",
		  "name": "_owner"
		},
		{
		  "type": "address",
		  "name": "_delegateOwner"
		},
		{
		  "type": "address",
		  "name": "_keyBucket"
		},
		{
		  "type": "address",
		  "name": "_esXaiStakeBucket"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "isUserEngagedWithPool",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "user"
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
	  "name": "keyBucket",
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
	  "name": "keyBucketShare",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [],
	  "outputs": [
		{
		  "type": "uint32",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "keyIdIndex",
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
		  "type": "uint256",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "logo",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [],
	  "outputs": [
		{
		  "type": "string",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "name",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [],
	  "outputs": [
		{
		  "type": "string",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "ownerShare",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [],
	  "outputs": [
		{
		  "type": "uint32",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "poolOwner",
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
	  "name": "poolOwnerClaimableRewards",
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
	  "name": "refereeAddress",
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
	  "name": "socials",
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
		  "type": "string",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "stakeEsXai",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "owner"
		},
		{
		  "type": "uint256",
		  "name": "amount"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "stakeKeys",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "owner"
		},
		{
		  "type": "uint256[]",
		  "name": "keyIds"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "stakedAmounts",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": ""
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
	  "name": "stakedBucketShare",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [],
	  "outputs": [
		{
		  "type": "uint32",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "stakedKeys",
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
		  "type": "uint256",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "stakedKeysIndices",
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
		  "type": "uint256",
		  "name": ""
		}
	  ]
	},
	{
	  "type": "function",
	  "name": "stakedKeysOfOwner",
	  "constant": true,
	  "stateMutability": "view",
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": ""
		},
		{
		  "type": "uint256",
		  "name": ""
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
	  "name": "unstakeEsXai",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "owner"
		},
		{
		  "type": "uint256",
		  "name": "unstakeRequestIndex"
		},
		{
		  "type": "uint256",
		  "name": "amount"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "unstakeKeys",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "owner"
		},
		{
		  "type": "uint256",
		  "name": "unstakeRequestIndex"
		},
		{
		  "type": "uint256[]",
		  "name": "keyIds"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "updateDelegateOwner",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "address",
		  "name": "delegate"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "updateMetadata",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "string[3]",
		  "name": "_metaData"
		},
		{
		  "type": "string[]",
		  "name": "_socials"
		}
	  ],
	  "outputs": []
	},
	{
	  "type": "function",
	  "name": "updateShares",
	  "constant": false,
	  "payable": false,
	  "inputs": [
		{
		  "type": "uint32",
		  "name": "_ownerShare"
		},
		{
		  "type": "uint32",
		  "name": "_keyBucketShare"
		},
		{
		  "type": "uint32",
		  "name": "_stakedBucketShare"
		}
	  ],
	  "outputs": []
	}
  ] as const;