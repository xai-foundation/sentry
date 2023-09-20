import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { config as coreConfig } from "../core/src/config";

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "arbitrumGoerli",
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    xai: {
      url: "https://testnet.xai-chain.net/rpc",
      chainId: 47279324479,
      accounts: { mnemonic: process.env.MNEMONIC },
      gasPrice: 20000000000,
    },
    arbitrumGoerli: {
      url: coreConfig.defaultRpcUrl,
      accounts: { mnemonic: process.env.MNEMONIC },
      gasPrice: 20000000000,
    },
  },
  etherscan: {
    apiKey: {
      arbitrumGoerli: process.env.ARBISCAN_API_KEY as string
    }
  }
};

export default config;