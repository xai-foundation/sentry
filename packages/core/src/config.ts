export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x429D521d5a6a277d270a618B0D2673F4EB71308F",
  "esXaiDeployedBlockNumber": 56622648,
  "esXaiImplementationAddress": "0xcd92c3ecb510efe652cf51c14273f7dc25908c90",
  "gasSubsidyAddress": "0x082607B54A78743B08b01c822d843134c45e2EB7",
  "gasSubsidyDeployedBlockNumber": 56622651,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x24Ea034c50C062D9B62882f9bD843B359c72ADCc",
  "nodeLicenseDeployedBlockNumber": 56622698,
  "nodeLicenseImplementationAddress": "0x250af1a40573e2d62f085dc1e263824143509649",
  "refereeAddress": "0x129671Ae7eAfdFe846E5ef472C6035FC84649047",
  "refereeDeployedBlockNumber": 56622665,
  "refereeImplementationAddress": "0xb95274e633207dfa5912ef342a9b7546186d54a9",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x2bf1E64f1393555ecc5EC32633010d786916aEDD",
  "xaiDeployedBlockNumber": 56622644,
  "xaiImplementationAddress": "0x4ebcb47eb6ffa5c6efc6cca5f94ab00f9cd8d1d8"
};

export function setConfig(_config: any) { config = _config; }