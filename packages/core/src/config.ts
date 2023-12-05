export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x03344E4B7fe3f31377C481ffB2C6236aF9CD5371",
  "esXaiDeployedBlockNumber": 57972811,
  "esXaiImplementationAddress": "0x5c7d1f6fcc3f3fd688ffe86740904679a9272c2b",
  "gasSubsidyAddress": "0x83a3AbFF2C603F42A2C86580D4FA6f58C81248dd",
  "gasSubsidyDeployedBlockNumber": 57972819,
  "gasSubsidyImplementationAddress": "0x85d0d1db6815aef063246915b55763b5f0ab7c92",
  "nodeLicenseAddress": "0x3c9462C4c252FdB7c0802CA3687206A08893D8Ff",
  "nodeLicenseDeployedBlockNumber": 57972887,
  "nodeLicenseImplementationAddress": "0x9646056451c23c7e5c2b4d2ab04a6cf4c56d93ae",
  "refereeAddress": "0x50b2b682b59b40A3B520C8AC6FF0237ff974886a",
  "refereeDeployedBlockNumber": 57972841,
  "refereeImplementationAddress": "0xa9e0de05cf7a4a6801d1bf50d33d1e5c5ac4f196",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x65f8d6077e2c1F4426bbEBF0950FdeA9a771270C",
  "xaiDeployedBlockNumber": 57972788,
  "xaiImplementationAddress": "0x146cc049c9496d087246faa144bc2d757314751c"
};

export function setConfig(_config: any) { config = _config; }