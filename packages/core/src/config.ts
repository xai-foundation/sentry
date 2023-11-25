export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0xfA205475Dd70742f8923685821655b3b7191587c",
  "esXaiDeployedBlockNumber": 56769121,
  "esXaiImplementationAddress": "0xcd92c3ecb510efe652cf51c14273f7dc25908c90",
  "gasSubsidyAddress": "0x906c8ED735EEBf4a8F0AA865ead8D5BeD338e535",
  "gasSubsidyDeployedBlockNumber": 56769127,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0xA1Ea1fa9D11A6E854f71fCF4D848B76Ac1036b29",
  "nodeLicenseDeployedBlockNumber": 56769186,
  "nodeLicenseImplementationAddress": "0x3bf78c60e6c5c7ab124a29cad2f420f8ae20e178",
  "refereeAddress": "0x5460057036896A698c2780Ea59195358dAF9f210",
  "refereeDeployedBlockNumber": 56769142,
  "refereeImplementationAddress": "0xd8ad92ee006059c764620c7883fc2128660f8f2b",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x1eec36A4cda02FAB5D17bC2A726754F46355a5fB",
  "xaiDeployedBlockNumber": 56769110,
  "xaiImplementationAddress": "0xfd98af8b549279237113f5be5bd53882ad0a5fce"
};

export function setConfig(_config: any) { config = _config; }