export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0xCAE3036e6D9750dE6857F9E7fB761da3041e20Ef",
  "esXaiDeployedBlockNumber": 55618631,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0x6A08574064C931a0e283820a57214600Dd43e230",
  "gasSubsidyDeployedBlockNumber": 55618636,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0xb1Cd40e9c88fd35C9efdd07795Fa64Ee6c6bD686",
  "nodeLicenseDeployedBlockNumber": 55618673,
  "nodeLicenseImplementationAddress": "0xb8798696670b7acecc0a3f6ead800d1125108d81",
  "refereeAddress": "0x0A87518924dcfB62Ab913EAb1f6099861d243d4D",
  "refereeDeployedBlockNumber": 55618644,
  "refereeImplementationAddress": "0xa7f7d9b1a8de92a353b80815772bf5513dfcd0ff",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xB33C12d43D37d3A137471515aEbCEAA58d60da31",
  "xaiDeployedBlockNumber": 55618616,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }