export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0xb5e8fbaa59c9945D904cbD86aA2d3CfB582Fc24F",
  "esXaiDeployedBlockNumber": 57927409,
  "esXaiImplementationAddress": "0x5c7d1f6fcc3f3fd688ffe86740904679a9272c2b",
  "gasSubsidyAddress": "0x761ddcEBf8b7074D1A7D7c4b7A62f4f0402B24c9",
  "gasSubsidyDeployedBlockNumber": 57927413,
  "gasSubsidyImplementationAddress": "0x85d0d1db6815aef063246915b55763b5f0ab7c92",
  "nodeLicenseAddress": "0xF85D703eB5863A5847B471a6eDfc7dc486231269",
  "nodeLicenseDeployedBlockNumber": 57927463,
  "nodeLicenseImplementationAddress": "0x9646056451c23c7e5c2b4d2ab04a6cf4c56d93ae",
  "refereeAddress": "0x85a79811B725fB038Be7015Efd086dFb2098A08D",
  "refereeDeployedBlockNumber": 57927431,
  "refereeImplementationAddress": "0x6f8ebef1ee878c8a19be3771eb45b888db9f9306",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x789022f746b579F5fb50F5c244986744AA526A51",
  "xaiDeployedBlockNumber": 57927400,
  "xaiImplementationAddress": "0x146cc049c9496d087246faa144bc2d757314751c"
};

export function setConfig(_config: any) { config = _config; }