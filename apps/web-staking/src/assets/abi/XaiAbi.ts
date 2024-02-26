export const XaiAbi = [
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
        "name": "spender",
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
    "type": "event",
    "anonymous": false,
    "name": "ConvertedToEsXai",
    "inputs": [
      {
        "type": "address",
        "name": "user",
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
    "name": "EsXaiAddressSet",
    "inputs": [
      {
        "type": "address",
        "name": "newEsXaiAddress",
        "indexed": true
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
    "name": "MAX_SUPPLY",
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
    "name": "MINTER_ROLE",
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
    "name": "allowance",
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
        "name": "spender"
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
    "name": "approve",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "spender"
      },
      {
        "type": "uint256",
        "name": "amount"
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
    "name": "burn",
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
    "name": "burnFrom",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "account"
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
    "name": "convertToEsXai",
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
    "name": "decimals",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint8",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "decreaseAllowance",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "spender"
      },
      {
        "type": "uint256",
        "name": "subtractedValue"
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
    "name": "increaseAllowance",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "spender"
      },
      {
        "type": "uint256",
        "name": "addedValue"
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
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "mint",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "to"
      },
      {
        "type": "uint256",
        "name": "amount"
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
    "name": "setEsXaiAddress",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "newEsXaiAddress"
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
    "name": "transfer",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "to"
      },
      {
        "type": "uint256",
        "name": "amount"
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
    "name": "transferFrom",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "from"
      },
      {
        "type": "address",
        "name": "to"
      },
      {
        "type": "uint256",
        "name": "amount"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  }
] as const;