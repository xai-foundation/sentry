export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x28C3b753166771F947Ffb0c07cbce1A2D87dFd32",
  "esXaiDeployedBlockNumber": 56767923,
  "esXaiImplementationAddress": "0xcd92c3ecb510efe652cf51c14273f7dc25908c90",
  "gasSubsidyAddress": "0xb881E386DfFC499ac4Cb8ADF8e0b5B42bBcE5f5f",
  "gasSubsidyDeployedBlockNumber": 56767930,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x76DeA7531F6125f226c5253456017Bd76293bFB2",
  "nodeLicenseDeployedBlockNumber": 56767991,
  "nodeLicenseImplementationAddress": "0x3bf78c60e6c5c7ab124a29cad2f420f8ae20e178",
  "refereeAddress": "0xeb75e298482A8943abAF72E91b1D96c84Bd6B95a",
  "refereeDeployedBlockNumber": 56767944,
  "refereeImplementationAddress": "0xf0645b5f2c3a1c756c4ef66cb89c535a5fa262a1",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x184395B3d6bB5091cAE009EDB3F67C560ba3D689",
  "xaiDeployedBlockNumber": 56767907,
  "xaiImplementationAddress": "0xfd98af8b549279237113f5be5bd53882ad0a5fce"
};

export function setConfig(_config: any) { config = _config; }