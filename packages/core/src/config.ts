export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x10DB41fdAd408894812222E2C0f0eAF09a104D6F",
  "esXaiDeployedBlockNumber": 56521735,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0x8FDB98406D6C6cc99e6E3a22AC94aAd558B6D31b",
  "gasSubsidyDeployedBlockNumber": 56521738,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x6b530fE7897db781d68e552c8Ac7F0Ae18adc208",
  "nodeLicenseDeployedBlockNumber": 56521790,
  "nodeLicenseImplementationAddress": "0x250af1a40573e2d62f085dc1e263824143509649",
  "refereeAddress": "0xa556C92986eAC114A11fD4754FeEd4B8D664ee5e",
  "refereeDeployedBlockNumber": 56521753,
  "refereeImplementationAddress": "0xb95274e633207dfa5912ef342a9b7546186d54a9",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xEbb60B67551ca707C39C6E25E2cAf6795A4C6869",
  "xaiDeployedBlockNumber": 56521720,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }