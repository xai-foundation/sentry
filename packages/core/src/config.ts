
export const MAINNET_ID = 42161;
export const TESTNET_ID = 421614;

const mainnetConfig = {
  arbitrumBlockExplorer: "https://arbiscan.io",
  arbitrumGoerliBlockExplorer: "https://goerli.arbiscan.io",
  arbitrumOneJsonRpcUrl: (typeof process !== 'undefined' && process.env && process.env.ARB_ONE_RPC) || "https://arb-mainnet.g.alchemy.com/v2/oD4X3JXvJclnt36mDkqnp9CO2sZkNhYT",
  arbitrumOneWebSocketUrl: (typeof process !== 'undefined' && process.env && process.env.ARB_ONE_WEBSOCKET) || "wss://arb-mainnet.g.alchemy.com/v2/oD4X3JXvJclnt36mDkqnp9CO2sZkNhYT",
  defaultRpcUrl: "https://arb-mainnet.g.alchemy.com/v2/oD4X3JXvJclnt36mDkqnp9CO2sZkNhYT",
  chainlinkEthUsdPriceFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  chainlinkXaiUsdPriceFeed: "0x806c532D543352e7C344ba6C7F3F00Bfbd309Af1",
  esXaiAddress: "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c",
  esXaiDeployedBlockNumber: 157193630,
  esXaiImplementationAddress: "0x8d6C063656b00E5c37CE007C0f99848D58F19d6B",
  gasSubsidyAddress: "0x94F4aBC83eae00b693286B6eDCa09e1D76183C97",
  gasSubsidyDeployedBlockNumber: 157193649,
  gasSubsidyImplementationAddress: "0xF208798482F0b12c8767Bc03cC0F145D18BeCe6A",
  nodeLicenseAddress: "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66",
  nodeLicenseDeployedBlockNumber: 157193743,
  nodeLicenseImplementationAddress: "0xf765452e587ad0ae785dc984963897c05d4c8c71",
  refereeAddress: "0xfD41041180571C5D371BEA3D9550E55653671198",
  refereeDeployedBlockNumber: 157193676,
  refereeImplementationAddress: "0x29A7b907FdF4a9235F46d891b7Aa1e7d3D35A3b6",
  refereeCalculationsAddress: "0xCd62360854aecf6285Fa310D69C5EBaf4Cd5e95F",
  rollupAddress: "0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336",
  xaiAddress: "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66",
  xaiDeployedBlockNumber: 157193610,
  xaiImplementationAddress: "0x3fB787101DC6Be47cfe18aeEe15404dcC842e6AF",
  xaiGaslessClaimAddress: "0x149107dEB70b9514930d8e454Fc32E77C5ABafE0",
  xaiRedEnvelope2024Address: "0x080C2e59e963959Bbe9Ea064d1bcBc881F380Ff2",
  xaiRedEnvelope2024ImplementationAddress: "0xf26Af8313cB039A58b86c2Ab7aA5c540EcEEB70f",
  poolFactoryAddress: "0xF9E08660223E2dbb1c0b28c82942aB6B5E38b8E5",
  poolFactoryAddressImplementationAddress: "0x21EEC6626f15d02A8896ebB7EDD68ff3CB61e89E",
  defaultNetworkName: "arbitrum",
  subgraphEndpoint: "https://subgraph.satsuma-prod.com/f37507ea64fb/xai/sentry/api",
  publicRPC: "https://arb1.arbitrum.io/rpc",
  alchemyApiKey: "oD4X3JXvJclnt36mDkqnp9CO2sZkNhYT",
  crossmintProjectId: "", //TODO Add Production Values
  crossmintCollectionId: "", //TODO Add Production Values
  minSecondsBetweenChallenges: 50 * 60, // 1 hour
  sentryKeySaleURI: "https://sentry.xai.games" // redirect from within desktop client for web3 interaction
};

const testnetConfig: Config = {
  arbitrumBlockExplorer: "https://sepolia.arbiscan.io",
  arbitrumOneJsonRpcUrl: (typeof process !== 'undefined' && process.env && process.env.ARB_ONE_RPC) || "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  arbitrumOneWebSocketUrl: (typeof process !== 'undefined' && process.env && process.env.ARB_ONE_WEBSOCKET) || "wss://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  defaultRpcUrl: "https://arb-sepolia.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
  arbitrumGoerliBlockExplorer: "https://goerli.arbiscan.io",
  esXaiAddress: "0x5776784C2012887D1f2FA17281E406643CBa5330",
  chainlinkEthUsdPriceFeed: "0x96452A47527e30a50F238c9867663F7c4D1e8656",
  chainlinkXaiUsdPriceFeed: "0x88EBC5D5317BC539efdb01dc8f425808B402D420",
  esXaiDeployedBlockNumber: 157193630,
  esXaiImplementationAddress: "0x8d6C063656b00E5c37CE007C0f99848D58F19d6B",
  gasSubsidyAddress: "0x94F4aBC83eae00b693286B6eDCa09e1D76183C97",
  gasSubsidyDeployedBlockNumber: 157193649,
  gasSubsidyImplementationAddress: "0xF208798482F0b12c8767Bc03cC0F145D18BeCe6A",
  nodeLicenseAddress: "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2",
  nodeLicenseDeployedBlockNumber: 157193743,
  nodeLicenseImplementationAddress: "0xf765452e587Ad0AE785Dc984963897c05d4c8c71",
  refereeAddress: "0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b",
  refereeDeployedBlockNumber: 157193676,
  refereeImplementationAddress: "0x29A7b907FdF4a9235F46d891b7Aa1e7d3D35A3b6",
  refereeCalculationsAddress: "0x86Ca7fF8F3450672E6e7404dfce147CC9DBCaF51",
  rollupAddress: "0xb3b08bE5041d3F94C9fD43c91434515a184a43af",
  xaiAddress: "0x724E98F16aC707130664bb00F4397406F74732D0",
  xaiDeployedBlockNumber: 157193610,
  xaiImplementationAddress: "0x3fB787101DC6Be47cfe18aeEe15404dcC842e6AF",
  xaiGaslessClaimAddress: "0x149107dEB70b9514930d8e454Fc32E77C5ABafE0",
  xaiRedEnvelope2024Address: "0x080C2e59e963959Bbe9Ea064d1bcBc881F380Ff2",
  xaiRedEnvelope2024ImplementationAddress: "0xf26Af8313cB039A58b86c2Ab7aA5c540EcEEB70f",
  poolFactoryAddress: "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
  poolFactoryAddressImplementationAddress: "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
  defaultNetworkName: "arbitrumSepolia",
  subgraphEndpoint: "https://subgraph.satsuma-prod.com/f37507ea64fb/xai/sentry-sepolia/version/0.0.25-sepolia-mock-103/api", // TODO Update to point to live
  publicRPC: "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  alchemyApiKey: "8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  crossmintProjectId: "cc616c84-6479-4981-a24e-adb4278df212",
  crossmintCollectionId: "854640e1-149c-4092-a40b-bdf2a3f36e64",
  minSecondsBetweenChallenges: 5 * 60, // 5 minutes on testnet
  sentryKeySaleURI: "https://sentry.xai.games" // redirect from within desktop client for web3 interaction
};

export let config: Config = mainnetConfig;

export function setConfigByChainId(chainId: number): void {
  switch (chainId) {
    case MAINNET_ID:
      config = mainnetConfig;
      break;
    case TESTNET_ID:
      config = testnetConfig;
      break;
    default:
      config = mainnetConfig;
  }
}

export function setConfig(newConfig: Config): void {
  config = newConfig;
}

export type Config = typeof mainnetConfig
