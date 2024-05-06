
export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "arbitrumOneJsonRpcUrl": "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  "arbitrumOneWebSocketUrl": "wss://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  "defaultRpcUrl": "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
  "esXaiAddress": "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c",
  "esXaiDeployedBlockNumber": 157193630,
  "esXaiImplementationAddress": "0x8d6c063656b00e5c37ce007c0f99848d58f19d6b",
  "gasSubsidyAddress": "0x94F4aBC83eae00b693286B6eDCa09e1D76183C97",
  "gasSubsidyDeployedBlockNumber": 157193649,
  "gasSubsidyImplementationAddress": "0xf208798482f0b12c8767bc03cc0f145d18bece6a",
  "nodeLicenseAddress": "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2",
  "nodeLicenseDeployedBlockNumber": 157193743,
  "nodeLicenseImplementationAddress": "0xf765452e587ad0ae785dc984963897c05d4c8c71",
  "refereeAddress": "0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b",
  "refereeDeployedBlockNumber": 157193676,
  "refereeImplementationAddress": "0x29a7b907fdf4a9235f46d891b7aa1e7d3d35a3b6",
  "rollupAddress": "0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336",
  "xaiAddress": "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66",
  "xaiDeployedBlockNumber": 157193610,
  "xaiImplementationAddress": "0x3fb787101dc6be47cfe18aeee15404dcc842e6af",
  "xaiGaslessClaimAddress": "0x149107dEB70b9514930d8e454Fc32E77C5ABafE0",
  "xaiRedEnvelope2024Address": "0x080C2e59e963959Bbe9Ea064d1bcBc881F380Ff2",
  "xaiRedEnvelope2024ImplementationAddress": "0xf26Af8313cB039A58b86c2Ab7aA5c540EcEEB70f",
  "poolFactoryAddress": "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
  "poolFactoryAddressImplementationAddress": "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
  "defaultNetworkName": "arbitrumSepolia"
};

export function setConfig(_config: any) { config = _config; }