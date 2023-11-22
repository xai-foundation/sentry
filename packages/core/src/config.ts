export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0xf24FF1045b42786FF29a7732Ae2A505D8E389ACE",
  "esXaiDeployedBlockNumber": 56459796,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0xb33bFb6E3eF09b8c280663A2090A9C3A99a78491",
  "gasSubsidyDeployedBlockNumber": 56459804,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x2bb8b202E93491Cf45E8B41cF61C057e3D0C7e40",
  "nodeLicenseDeployedBlockNumber": 56459847,
  "nodeLicenseImplementationAddress": "0xb8798696670b7acecc0a3f6ead800d1125108d81",
  "refereeAddress": "0xF1De3f16Dee33741A87F288678216f78E1928C32",
  "refereeDeployedBlockNumber": 56459818,
  "refereeImplementationAddress": "0x5f429c1643cce6aa2faa80ac987f17aee9b39e92",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x66Cd545aDc153Bb7753b56def5e2446105968ce8",
  "xaiDeployedBlockNumber": 56459785,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }