export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0xA16d6A6913f8a975Ad47A81BD4b5de5b08c7B3E0",
  "esXaiDeployedBlockNumber": 56481605,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0x9f9BA5946134A4BF7792a83BA7016D7c8E5AF4e7",
  "gasSubsidyDeployedBlockNumber": 56481610,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x4e6c0ca1d58bb4735399237467024d26Cb1e7723",
  "nodeLicenseDeployedBlockNumber": 56481650,
  "nodeLicenseImplementationAddress": "0x3db2ad23211928394ace2751398202aa77eb41cb",
  "refereeAddress": "0xF744A9910B9b4220E2754785C769a5d3280EcEf6",
  "refereeDeployedBlockNumber": 56481622,
  "refereeImplementationAddress": "0xb95274e633207dfa5912ef342a9b7546186d54a9",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x0b2E23261aF3Cf79e2141e1E483E3cfeD374a42E",
  "xaiDeployedBlockNumber": 56481595,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }