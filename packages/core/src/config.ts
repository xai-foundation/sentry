export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0xB9064b6539Ae35043C9Cf19A2a59313b9a0EbA3b",
  "esXaiDeployedBlockNumber": 51071371,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "nodeLicenseAddress": "0x519F6a95Ac1EE49dB511Ac806F7C458926307850",
  "nodeLicenseDeployedBlockNumber": 51071392,
  "nodeLicenseImplementationAddress": "0x9744d499c33d745cb4cd0feddbb05ff2cff80ea8",
  "refereeAddress": "0x71817ADF87AB33294CbCd43c0e477f5Fe8C45610",
  "refereeDeployedBlockNumber": 51071355,
  "refereeImplementationAddress": "0x131fb833441bd4ac7081064eb0a348e78749c35f",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x8c1aFC9E9e30D4caaaca1580Cb38dd5c63D41eEb",
  "xaiDeployedBlockNumber": 51071337,
  "xaiImplementationAddress": "0x0bd8ce521e337bc10c3fa891bb68aa411de37941"
};

export function setConfig(_config: any) { config = _config; }