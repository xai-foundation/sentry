require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
const dotenv = require("dotenv");
require("hardhat-contract-sizer");

dotenv.config();

const accounts = {
  mnemonic: process.env.MNEMONIC,
  count: 30,
};

const config = {
  defaultNetwork: "arbitrumSepolia",
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true
            }
          },
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        }
      }
    ]
  },
  networks: {
    hardhat: {
      // forking: {
		  // url: "https://arb1.arbitrum.io/rpc",
		  // blockNumber: 184085729,
     // },
      chainId: 1,
      accounts,
      gas: "auto",
    },
    arbitrumOne: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts,
      chainId: 42161,
    },
    arbitrumSepolia: {
      url: "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
      accounts,
      chainId: 421614,
    }
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      }
    ]
  }
};

module.exports = config;
