export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x38e7F8c60B606d000df6d42227ca6142e923742B",
  "esXaiDeployedBlockNumber": 56765301,
  "esXaiImplementationAddress": "0xcd92c3ecb510efe652cf51c14273f7dc25908c90",
  "gasSubsidyAddress": "0xeFA3C6137a7128b8de3D73692fD85246200a25fF",
  "gasSubsidyDeployedBlockNumber": 56765303,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0xAE171F100C32de6480b28A43a274AD3296A33719",
  "nodeLicenseDeployedBlockNumber": 56765357,
  "nodeLicenseImplementationAddress": "0x3bf78c60e6c5c7ab124a29cad2f420f8ae20e178",
  "refereeAddress": "0x51873903146B675d7450f4d1E4943Dd6bE734F8a",
  "refereeDeployedBlockNumber": 56765318,
  "refereeImplementationAddress": "0xb95274e633207dfa5912ef342a9b7546186d54a9",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x6F8dDc04e38ea9C72b615744b736d2e39e4aAC3d",
  "xaiDeployedBlockNumber": 56765288,
  "xaiImplementationAddress": "0xfd98af8b549279237113f5be5bd53882ad0a5fce"
};

export function setConfig(_config: any) { config = _config; }