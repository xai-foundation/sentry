export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x2f00602A48A42f66700AF7cDA166d1aBcbb60f54",
  "esXaiDeployedBlockNumber": 57988105,
  "esXaiImplementationAddress": "0x5c7d1f6fcc3f3fd688ffe86740904679a9272c2b",
  "gasSubsidyAddress": "0xdE098571583FF40BADf6a1877Bbe5b4890aF2dF3",
  "gasSubsidyDeployedBlockNumber": 57988112,
  "gasSubsidyImplementationAddress": "0x85d0d1db6815aef063246915b55763b5f0ab7c92",
  "nodeLicenseAddress": "0xfA802933C69FCC6166C1436FE5F8300aD347A4b0",
  "nodeLicenseDeployedBlockNumber": 57988175,
  "nodeLicenseImplementationAddress": "0x35bc89750a0f0bbb1a1395975a9cbbe4d53ffaac",
  "refereeAddress": "0x75fA4516F154C060A6849D308b9A2340282A046A",
  "refereeDeployedBlockNumber": 57988132,
  "refereeImplementationAddress": "0xa9e0de05cf7a4a6801d1bf50d33d1e5c5ac4f196",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x16aF708e96f52F860A365c6F6e42A421747C1301",
  "xaiDeployedBlockNumber": 57988088,
  "xaiImplementationAddress": "0x146cc049c9496d087246faa144bc2d757314751c"
};

export function setConfig(_config: any) { config = _config; }