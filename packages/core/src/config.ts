export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0x5865cBed96eeCdCEf953fEABB6FD2199952BDA1a",
  "esXaiDeployedBlockNumber": 55230677,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0x3A7add6C744CB6A709ed1c60A2feA86A766a6c22",
  "gasSubsidyDeployedBlockNumber": 55230680,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x664d48B78344fCfb07796F1C732Eae5B8c225231",
  "nodeLicenseDeployedBlockNumber": 55230721,
  "nodeLicenseImplementationAddress": "0xb8798696670b7acecc0a3f6ead800d1125108d81",
  "refereeAddress": "0x4A2a27f6106fd7dc9Ab658553395b34A2e886092",
  "refereeDeployedBlockNumber": 55230694,
  "refereeImplementationAddress": "0xc123c1e3bde3c6b2f8d0329d15d0e53416b95cda",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x721A90df597B3816423677C19e0d43Feb4A66577",
  "xaiDeployedBlockNumber": 55230666,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }