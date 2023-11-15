export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0x15dF4F9Af8579604A44046620e3AAdc85F438AD8",
  "esXaiDeployedBlockNumber": 55228418,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0xA920cC787BFeAD2e92db18b372e7B773C1CD1de8",
  "gasSubsidyDeployedBlockNumber": 55228421,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0xe25c2676E4295370dF992655DdF230A667f70f22",
  "nodeLicenseDeployedBlockNumber": 55228460,
  "nodeLicenseImplementationAddress": "0xb8798696670b7acecc0a3f6ead800d1125108d81",
  "refereeAddress": "0xbf2F145b0b5Df167f0417a5Adf076cc8bd879998",
  "refereeDeployedBlockNumber": 55228434,
  "refereeImplementationAddress": "0xd99c803d5824d718836f8038b22069c57415cdc7",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xD6C6040F36CBc5B4a54e4df87e2a8CD83791c4D7",
  "xaiDeployedBlockNumber": 55228409,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }