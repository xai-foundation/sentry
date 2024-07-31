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
  defaultNetwork: "arbitrumOne",
  solidity: {
    compilers: [
      {
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
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      // forking: {
		  // url: "https://tame-alpha-violet.arbitrum-mainnet.quiknode.pro/d55a31b32f04c82b0e1bcb77f1fc6dcf53147f2a/",
		  // blockNumber: 184085729,
      // },
      chainId: 1,
      accounts,
    },
    xai: {
      url: "https://xai-chain.net/rpc",
      chainId: 660279,
      accounts,
    }, 
    xaiTestnet2: {
      url: " https://testnet-v2.xai-chain.net/rpc",
      chainId: 37714555429,
      accounts,
    },
    arbitrumOne: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts,
      chainId: 42161,
    },
    arbitrumNova: {
      url: "https://little-wandering-spring.nova-mainnet.quiknode.pro/0cbb0ac3ce3e099934c24572aeeb2af9f53a3b92",
      accounts,
      chainId: 42170,
    },
    arbitrumGoerli: {
      url: "https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/",
      accounts,
      chainId: 421613,
      gasPrice: 20000000000,
    },
    arbitrumSepolia: {
      url: "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
      accounts,
      chainId: 421614,
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/0zXd3gviT-BxO1QiLjttH2DUV5ihyBPs",
      accounts,
      chainId: 11155111
    },
    ethereum: {
      url: "https://eth-mainnet.g.alchemy.com/v2/W7dTZrmhSSU7LOtL67I41XGaf2TXeVGo",
      accounts,
      chainId: 1
    }
  },
  etherscan: {
    apiKey: {
      arbitrumGoerli: process.env.ARBISCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumNova: process.env.ARBISCAN_NOVA_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      },
      {
        network: "arbitrumNova",
        chainId: 42170,
        urls: {
          apiURL: "https://api-nova.arbiscan.io/api",
          browserURL: "https://nova.arbiscan.io",
        }
      }
    ]
  }
};

module.exports = config;
