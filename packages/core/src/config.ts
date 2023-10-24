export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0xB224D6599CDE47c17d2051d90Dd0aD527baAe94C",
  "esXaiDeployedBlockNumber": 50253686,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "nodeLicenseAddress": "0x6Fe195f88f60da56A6a5Dd7f48dCE32f5B7E8212",
  "nodeLicenseDeployedBlockNumber": 50253705,
  "nodeLicenseImplementationAddress": "0x9744d499c33d745cb4cd0feddbb05ff2cff80ea8",
  "refereeAddress": "0x82A648a512Bb59600beCBd9E9B576a7d6a05aB8c",
  "refereeDeployedBlockNumber": 50253668,
  "refereeImplementationAddress": "0x2b784bf8f299b66524cfc0b4f80ac806625f5509",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xc57A77D6EE557906B8AF7Da162AB7dB26eE7eB2C",
  "xaiDeployedBlockNumber": 50253657,
  "xaiImplementationAddress": "0x0bd8ce521e337bc10c3fa891bb68aa411de37941"
};

export function setConfig(_config: any) { config = _config; }