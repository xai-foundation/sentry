require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
const dotenv = require("dotenv");

dotenv.config();

const config = {
  defaultNetwork: "hardhat",
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
        url: "https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/",
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
      url: "https://tame-alpha-violet.arbitrum-mainnet.quiknode.pro/d55a31b32f04c82b0e1bcb77f1fc6dcf53147f2a/",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 30,
      },
      chainId: 42161,
    },
    arbitrumGoerli: {
      url: "https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/",
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
