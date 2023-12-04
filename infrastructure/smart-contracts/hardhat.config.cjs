require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
const dotenv = require("dotenv");

dotenv.config();

const config = {
  defaultNetwork: "arbitrumGoerli",
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true
        }
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
        // blockNumber: 56122196,
      },
      chainId: 421613,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 30,
      },
    },  
    xai: {
      url: "https://testnet.xai-chain.net/rpc",
      chainId: 47279324479,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 30,
      },
      gasPrice: 20000000000,
    },
    arbitrumOne: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 30,
      },
      chainId: 42161,
    },
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 30,
      },
      chainId: 421613,
      gasPrice: 20000000000,
    },
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 30,
      },
      chainId: 421614,
      gasPrice: 20000000000,
    },
  },
  etherscan: {
    apiKey: {
      arbitrumGoerli: process.env.ARBISCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
    }
  }
};

module.exports = config;
