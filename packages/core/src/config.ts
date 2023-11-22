export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0x8fc499a94a46941b9E6abd7494F3aC1b06f30AE5",
  "esXaiDeployedBlockNumber": 56471922,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0x57dEB04EB1174866520aA5705eE2e7D6565b7CEd",
  "gasSubsidyDeployedBlockNumber": 56471926,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x1811b0348cBe8cb025354420710Ba8Db017cD0B9",
  "nodeLicenseDeployedBlockNumber": 56471970,
  "nodeLicenseImplementationAddress": "0x3db2ad23211928394ace2751398202aa77eb41cb",
  "refereeAddress": "0xac2133775f3Fd9784527B7bD90c4aaF80006C8EA",
  "refereeDeployedBlockNumber": 56471937,
  "refereeImplementationAddress": "0x5f429c1643cce6aa2faa80ac987f17aee9b39e92",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xc7a6B80B587DF6324EE7c2032B4E82D553924Ac8",
  "xaiDeployedBlockNumber": 56471910,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }