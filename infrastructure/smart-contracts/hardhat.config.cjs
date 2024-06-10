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
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 100,
            details: {
              yulDetails: {
                optimizerSteps: "u",
              },
            },
          },
        },
      },
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
    xaisepolia: {
      url: " https://testnet-v2.xai-chain.net/rpc",
      chainId: 37714555429,
      accounts,
    },
    arbitrumOne: {
      url: "https://tame-alpha-violet.arbitrum-mainnet.quiknode.pro/d55a31b32f04c82b0e1bcb77f1fc6dcf53147f2a/",
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
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: {
      arbitrumGoerli: process.env.ARBISCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumNova: process.env.ARBISCAN_NOVA_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      xaisepolia: "arbitrarystring (no API key needed)",
      xai: "arbitrarystring (no API key needed)",
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
      },
      {
        network: "xaisepolia",
        chainId: 37714555429,
        urls: {
          apiURL: "https://testnet-explorer-v2.xai-chain.net/api",
          browserURL: "https://testnet-explorer-v2.xai-chain.net",
        },
      },
      {
        network: "xai",
        chainId: 660279,
        urls: {
          apiURL: "https://explorer.xai-chain.net/api",
          browserURL: "https://explorer.xai-chain.net",
        }
      }
    ]
  }
};

module.exports = config;
