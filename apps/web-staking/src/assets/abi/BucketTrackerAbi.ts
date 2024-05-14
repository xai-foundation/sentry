export const BucketTrackerAbi = [
	{
		"type": "event",
		"anonymous": false,
		"name": "Claim",
		"inputs": [
			{
				"type": "address",
				"name": "account",
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
		"name": "DividendWithdrawn",
		"inputs": [
			{
				"type": "address",
				"name": "to",
				"indexed": true
			},
			{
				"type": "uint256",
				"name": "weiAmount",
				"indexed": false
			}
		]
	},
	{
		"type": "event",
		"anonymous": false,
		"name": "DividendsDistributed",
		"inputs": [
			{
				"type": "address",
				"name": "from",
				"indexed": true
			},
			{
				"type": "uint256",
				"name": "weiAmount",
				"indexed": false
			}
		]
	},
	{
		"type": "event",
		"anonymous": false,
		"name": "Transfer",
		"inputs": [
			{
				"type": "address",
				"name": "from",
				"indexed": true
			},
			{
				"type": "address",
				"name": "to",
				"indexed": true
			},
			{
				"type": "uint256",
				"name": "value",
				"indexed": false
			}
		]
	},
	{
		"type": "function",
		"name": "_totalDividendsDistributed",
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
		"name": "accumulativeDividendOf",
		"constant": true,
		"stateMutability": "view",
		"payable": false,
		"inputs": [
			{
				"type": "address",
				"name": "_owner"
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
		"name": "balanceOf",
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
		"name": "decimals",
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
		"name": "distributeDividends",
		"constant": false,
		"payable": false,
		"inputs": [
			{
				"type": "uint256",
				"name": "amount"
			}
		],
		"outputs": []
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
		"name": "getAccount",
		"constant": true,
		"stateMutability": "view",
		"payable": false,
		"inputs": [
			{
				"type": "address",
				"name": "_account"
			}
		],
		"outputs": [
			{
				"type": "address",
				"name": "account"
			},
			{
				"type": "uint256",
				"name": "withdrawableDividends"
			},
			{
				"type": "uint256",
				"name": "totalDividends"
			},
			{
				"type": "uint256",
				"name": "lastClaimTime"
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
				"name": "_trackerOwner"
			},
			{
				"type": "address",
				"name": "_esXaiAddress"
			},
			{
				"type": "string",
				"name": "__name"
			},
			{
				"type": "string",
				"name": "__symbol"
			},
			{
				"type": "uint256",
				"name": "__decimals"
			}
		],
		"outputs": []
	},
	{
		"type": "function",
		"name": "lastClaimTimes",
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
		"name": "owner",
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
		"name": "processAccount",
		"constant": false,
		"payable": false,
		"inputs": [
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
		"name": "setBalance",
		"constant": false,
		"payable": false,
		"inputs": [
			{
				"type": "address",
				"name": "account"
			},
			{
				"type": "uint256",
				"name": "newBalance"
			}
		],
		"outputs": []
	},
	{
		"type": "function",
		"name": "symbol",
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
		"name": "totalDividendsDistributed",
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
		"name": "totalSupply",
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
		"name": "trackerOwner",
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
		"name": "withdrawableDividendOf",
		"constant": true,
		"stateMutability": "view",
		"payable": false,
		"inputs": [
			{
				"type": "address",
				"name": "_owner"
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
		"name": "withdrawnDividendOf",
		"constant": true,
		"stateMutability": "view",
		"payable": false,
		"inputs": [
			{
				"type": "address",
				"name": "_owner"
			}
		],
		"outputs": [
			{
				"type": "uint256",
				"name": ""
			}
		]
	}
] as const;