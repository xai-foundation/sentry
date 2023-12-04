export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0xFE0A2125C65Fd7A9d7ce8378D662709Fa2eB2ff0",
  "esXaiDeployedBlockNumber": 57848220,
  "esXaiImplementationAddress": "0x5c7d1f6fcc3f3fd688ffe86740904679a9272c2b",
  "gasSubsidyAddress": "0x09De2b9427aa3b725A1497e11336E149Ff1B23C9",
  "gasSubsidyDeployedBlockNumber": 57848231,
  "gasSubsidyImplementationAddress": "0x85d0d1db6815aef063246915b55763b5f0ab7c92",
  "nodeLicenseAddress": "0xb640a768f94e69fE8255320d306016EB2778c0E9",
  "nodeLicenseDeployedBlockNumber": 57848326,
  "nodeLicenseImplementationAddress": "0x9646056451c23c7e5c2b4d2ab04a6cf4c56d93ae",
  "refereeAddress": "0x412d5d616f21da31D814e7695f9f5E6fb54D3975",
  "refereeDeployedBlockNumber": 57848259,
  "refereeImplementationAddress": "0x6f8ebef1ee878c8a19be3771eb45b888db9f9306",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xA9FA3d2086A827Ea48693F898c88b1322A4b014B",
  "xaiDeployedBlockNumber": 57848198,
  "xaiImplementationAddress": "0x146cc049c9496d087246faa144bc2d757314751c"
};

export function setConfig(_config: any) { config = _config; }