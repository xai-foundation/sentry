export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "arbitrumOneJsonRpcUrl": "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
  "arbitrumOneWebSocketUrl": "wss://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
  "defaultRpcUrl": "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
  "esXaiAddress": "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c",
  "esXaiDeployedBlockNumber": 157193630,
  "esXaiImplementationAddress": "0x8d6c063656b00e5c37ce007c0f99848d58f19d6b",
  "gasSubsidyAddress": "0x94F4aBC83eae00b693286B6eDCa09e1D76183C97",
  "gasSubsidyDeployedBlockNumber": 157193649,
  "gasSubsidyImplementationAddress": "0xf208798482f0b12c8767bc03cc0f145d18bece6a",
  "nodeLicenseAddress": "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66",
  "nodeLicenseDeployedBlockNumber": 157193743,
  "nodeLicenseImplementationAddress": "0xf765452e587ad0ae785dc984963897c05d4c8c71",
  "refereeAddress": "0xfD41041180571C5D371BEA3D9550E55653671198",
  "refereeDeployedBlockNumber": 157193676,
  "refereeImplementationAddress": "0x29a7b907fdf4a9235f46d891b7aa1e7d3d35a3b6",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66",
  "xaiDeployedBlockNumber": 157193610,
  "xaiImplementationAddress": "0x3fb787101dc6be47cfe18aeee15404dcc842e6af"
};

export function setConfig(_config: any) { config = _config; }