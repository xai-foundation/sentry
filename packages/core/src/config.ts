export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0xF177184Be7c89c3246e279a0d9FE14B2aDE5FdbC",
  "esXaiDeployedBlockNumber": 52003981,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "nodeLicenseAddress": "0x59BF0e0f44E51DF8E7D5b1fa982e0Ad8E0f1F31c",
  "nodeLicenseDeployedBlockNumber": 52004001,
  "nodeLicenseImplementationAddress": "0x9281384fc315bff9d3cee3851ba7d907a9b65180",
  "refereeAddress": "0xCf9a2c4b4264b704A852609211C4c81E86dcD698",
  "refereeDeployedBlockNumber": 52003967,
  "refereeImplementationAddress": "0xfb7ad5601d57c07a8ce495b88b77c82e5a97ee12",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x10f3E3778eaBE38Ed561052d429B31c5c2faCc59",
  "xaiDeployedBlockNumber": 52003954,
  "xaiImplementationAddress": "0x0bd8ce521e337bc10c3fa891bb68aa411de37941"
};

export function setConfig(_config: any) { config = _config; }