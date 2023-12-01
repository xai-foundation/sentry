export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x32a1aB646545B58A446B33833b3d4a3066F0a4e1",
  "esXaiDeployedBlockNumber": 57561314,
  "esXaiImplementationAddress": "0x5c7d1f6fcc3f3fd688ffe86740904679a9272c2b",
  "gasSubsidyAddress": "0x14495afa43e9740b8569D54a57624bdbd0B3467C",
  "gasSubsidyDeployedBlockNumber": 57561323,
  "gasSubsidyImplementationAddress": "0x85d0d1db6815aef063246915b55763b5f0ab7c92",
  "nodeLicenseAddress": "0x7DFFCBa9268f3F2CB2116d7754bd7D0278E9157f",
  "nodeLicenseDeployedBlockNumber": 57561387,
  "nodeLicenseImplementationAddress": "0x9646056451c23c7e5c2b4d2ab04a6cf4c56d93ae",
  "refereeAddress": "0x050A19038D5C7c7D2901B28eB6C375a1a9f09FE7",
  "refereeDeployedBlockNumber": 57561341,
  "refereeImplementationAddress": "0x9b29aec355bb4fb5da339890945bf77a93f71ba3",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xf6fe4082a71226eC7AE1070B9dEC64d23CFa1B78",
  "xaiDeployedBlockNumber": 57561301,
  "xaiImplementationAddress": "0x146cc049c9496d087246faa144bc2d757314751c"
};

export function setConfig(_config: any) { config = _config; }