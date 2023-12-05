export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0xa799C4842e7364C14D79F34A66E0B9DbDC124063",
  "esXaiDeployedBlockNumber": 57968830,
  "esXaiImplementationAddress": "0x5c7d1f6fcc3f3fd688ffe86740904679a9272c2b",
  "gasSubsidyAddress": "0x20C1fAe4C869e22c6c156C55C269cCc36D0a78D1",
  "gasSubsidyDeployedBlockNumber": 57968834,
  "gasSubsidyImplementationAddress": "0x85d0d1db6815aef063246915b55763b5f0ab7c92",
  "nodeLicenseAddress": "0x1e6A526E2cfd6F2FB4649c62F7034B0FA95Db04C",
  "nodeLicenseDeployedBlockNumber": 57968908,
  "nodeLicenseImplementationAddress": "0x9646056451c23c7e5c2b4d2ab04a6cf4c56d93ae",
  "refereeAddress": "0x3F390d7e8020A12AC3fB7f24d81D5ba7d186F976",
  "refereeDeployedBlockNumber": 57968863,
  "refereeImplementationAddress": "0x3d4045322dee7dffaacb327203cdbe35b9062175",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xCD4144CAeA6340ca46D7C5FE9961498c2E649b64",
  "xaiDeployedBlockNumber": 57968816,
  "xaiImplementationAddress": "0x146cc049c9496d087246faa144bc2d757314751c"
};

export function setConfig(_config: any) { config = _config; }