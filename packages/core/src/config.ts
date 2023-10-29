export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x2501E0d00761d0931c334Fbf14f6c3fb737B88cE",
  "esXaiDeployedBlockNumber": 51567860,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "nodeLicenseAddress": "0x8FbEAd06a0E0259d42481cd361539Fc2bFD0deeB",
  "nodeLicenseDeployedBlockNumber": 51567882,
  "nodeLicenseImplementationAddress": "0x3f9d01e99c759ef38710e1f095ca7a35eff1da15",
  "refereeAddress": "0x49D9a29faCFb71c395e4871c84D4bDB4953BF144",
  "refereeDeployedBlockNumber": 51567843,
  "refereeImplementationAddress": "0x131fb833441bd4ac7081064eb0a348e78749c35f",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xC8A7FCaF19947ddFcDa705e8B6962Dc4Ccec5Cd1",
  "xaiDeployedBlockNumber": 51567832,
  "xaiImplementationAddress": "0x0bd8ce521e337bc10c3fa891bb68aa411de37941"
};

export function setConfig(_config: any) { config = _config; }