export const RefereeAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "challengerPublicKey",
        "outputs": [
            {
                "name": "",
                "type": "bytes"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "rollupUserLogic",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint64"
            }
        ],
        "name": "challenges",
        "outputs": [
            {
                "name": "assertionId",
                "type": "uint64"
            },
            {
                "name": "predecessorAssertionId",
                "type": "uint64"
            },
            {
                "name": "assertionStateRoot",
                "type": "bytes32"
            },
            {
                "name": "assertionTimestamp",
                "type": "uint64"
            },
            {
                "name": "challengerSignedHash",
                "type": "bytes"
            },
            {
                "name": "activeChallengerPublicKey",
                "type": "bytes"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_challengerPublicKey",
                "type": "bytes"
            }
        ],
        "name": "setChallengerPublicKey",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_assertionId",
                "type": "uint64"
            },
            {
                "name": "_predecessorAssertionId",
                "type": "uint64"
            },
            {
                "name": "_assertionStateRoot",
                "type": "bytes32"
            },
            {
                "name": "_assertionTimestamp",
                "type": "uint64"
            },
            {
                "name": "_challengerSignedHash",
                "type": "bytes"
            }
        ],
        "name": "submitChallenge",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_challengeId",
                "type": "uint64"
            }
        ],
        "name": "getChallenge",
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "components": [
                    {
                        "name": "assertionId",
                        "type": "uint64"
                    },
                    {
                        "name": "predecessorAssertionId",
                        "type": "uint64"
                    },
                    {
                        "name": "assertionStateRoot",
                        "type": "bytes32"
                    },
                    {
                        "name": "assertionTimestamp",
                        "type": "uint64"
                    },
                    {
                        "name": "challengerSignedHash",
                        "type": "bytes"
                    },
                    {
                        "name": "activeChallengerPublicKey",
                        "type": "bytes"
                    }
                ]
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "challenge",
                "type": "tuple",
                "components": [
                    {
                        "name": "assertionId",
                        "type": "uint64"
                    },
                    {
                        "name": "predecessorAssertionId",
                        "type": "uint64"
                    },
                    {
                        "name": "assertionStateRoot",
                        "type": "bytes32"
                    },
                    {
                        "name": "assertionTimestamp",
                        "type": "uint64"
                    },
                    {
                        "name": "challengerSignedHash",
                        "type": "bytes"
                    },
                    {
                        "name": "activeChallengerPublicKey",
                        "type": "bytes"
                    }
                ]
            }
        ],
        "name": "ChallengeSubmitted",
        "type": "event"
    }
];
