export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0xdb2532bAa9c293Cb3fdB8E201eb1FED655A0EEe0",
  "esXaiDeployedBlockNumber": 57586696,
  "esXaiImplementationAddress": "0x5c7d1f6fcc3f3fd688ffe86740904679a9272c2b",
  "gasSubsidyAddress": "0xCe899a92989779368D670e76056aCFA035a72BEa",
  "gasSubsidyDeployedBlockNumber": 57586706,
  "gasSubsidyImplementationAddress": "0x85d0d1db6815aef063246915b55763b5f0ab7c92",
  "nodeLicenseAddress": "0x934Ba6b80C865d9f12a3A0aEC893021466ea5385",
  "nodeLicenseDeployedBlockNumber": 57586755,
  "nodeLicenseImplementationAddress": "0x9646056451c23c7e5c2b4d2ab04a6cf4c56d93ae",
  "refereeAddress": "0xD1805d9F0265120EACb5ACdaE75d804551C8D15f",
  "refereeDeployedBlockNumber": 57586719,
  "refereeImplementationAddress": "0xb8f408485e1197dca4810307624889214eef28d5",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x571986d3250FAd5685a76b83e9F1e7dF8f50b267",
  "xaiDeployedBlockNumber": 57586678,
  "xaiImplementationAddress": "0x146cc049c9496d087246faa144bc2d757314751c"
};

export function setConfig(_config: any) { config = _config; }