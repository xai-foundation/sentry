export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0x98389e0e8625b062535917f9b0EEAa96719aD336",
  "esXaiDeployedBlockNumber": 53952535,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "nodeLicenseAddress": "0x2a0793E71d2D2ebA5C3728a9748EBd0C9FdE3D97",
  "nodeLicenseDeployedBlockNumber": 53952556,
  "nodeLicenseImplementationAddress": "0xe805ef0cc7c4cf8bf3efdde0725f6706505584e2",
  "refereeAddress": "0xDbDE060098fAf4Db1fC16A93ee9D2d5A8852ba58",
  "refereeDeployedBlockNumber": 53952525,
  "refereeImplementationAddress": "0xfb7ad5601d57c07a8ce495b88b77c82e5a97ee12",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x42C7CB922b17cC430a2fb5A800D9BA49BC195E73",
  "xaiDeployedBlockNumber": 53952518,
  "xaiImplementationAddress": "0x0bd8ce521e337bc10c3fa891bb68aa411de37941"
};

export function setConfig(_config: any) { config = _config; }