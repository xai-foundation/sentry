export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0xF0cdD8982A6A16f3943fbFdABCB66c3166f4Fa45",
  "esXaiDeployedBlockNumber": 55407619,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0xB9d56bC9Ba487a2b6710a321ad400bA107423FC2",
  "gasSubsidyDeployedBlockNumber": 55407625,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x12eA00269e06085E8f62C21fC232D4824fe2B1dF",
  "nodeLicenseDeployedBlockNumber": 55407683,
  "nodeLicenseImplementationAddress": "0xb8798696670b7acecc0a3f6ead800d1125108d81",
  "refereeAddress": "0xc9ea24F9425B94837eAE46ae922a53fDD6beAc40",
  "refereeDeployedBlockNumber": 55407645,
  "refereeImplementationAddress": "0xa7f7d9b1a8de92a353b80815772bf5513dfcd0ff",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x7Ef06bd82A3cc789DB43ECfe52be001f86d8dE14",
  "xaiDeployedBlockNumber": 55407606,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }