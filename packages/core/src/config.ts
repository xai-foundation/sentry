export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0x9c22B4114Cebeaa57EB26ED836C6Ac62B21Abb27",
  "esXaiDeployedBlockNumber": 56437526,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0xd504323d19213dD73944eEc9b74dF1cebF55Ff3c",
  "gasSubsidyDeployedBlockNumber": 56437532,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x050f628F54A7e7840aE7109F5339D5d3eB6E5652",
  "nodeLicenseDeployedBlockNumber": 56437579,
  "nodeLicenseImplementationAddress": "0xb8798696670b7acecc0a3f6ead800d1125108d81",
  "refereeAddress": "0xcE0F75690a8FB363bbdC1A32c85ee122edBb081b",
  "refereeDeployedBlockNumber": 56437544,
  "refereeImplementationAddress": "0x5f429c1643cce6aa2faa80ac987f17aee9b39e92",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xcC66e09Cc24c8D1494a4D1428aFC860d34757AB0",
  "xaiDeployedBlockNumber": 56437512,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }