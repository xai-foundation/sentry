export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x6aa982540552d8CD2d0FC4c8092f39D960D1c150",
  "esXaiDeployedBlockNumber": 56624634,
  "esXaiImplementationAddress": "0xcd92c3ecb510efe652cf51c14273f7dc25908c90",
  "gasSubsidyAddress": "0x3F05E8EA2914C9148a7838D2b5E7e9179008Fa0C",
  "gasSubsidyDeployedBlockNumber": 56624637,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x452a1adf28eca4E86c322fbeFa436D95C73A80Da",
  "nodeLicenseDeployedBlockNumber": 56624678,
  "nodeLicenseImplementationAddress": "0x250af1a40573e2d62f085dc1e263824143509649",
  "refereeAddress": "0x8764d5D7718D91e48cAa5b95f8E3AF4984605827",
  "refereeDeployedBlockNumber": 56624646,
  "refereeImplementationAddress": "0xb95274e633207dfa5912ef342a9b7546186d54a9",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xF1944571C55f5AED50Bafa94f212310e5CDa69c4",
  "xaiDeployedBlockNumber": 56624626,
  "xaiImplementationAddress": "0xfd98af8b549279237113f5be5bd53882ad0a5fce"
};

export function setConfig(_config: any) { config = _config; }