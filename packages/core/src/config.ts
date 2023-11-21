export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0xE62e7d6AdcDEe9950a98Ce4430159f5bBb7FE0c8",
  "esXaiDeployedBlockNumber": 56285742,
  "esXaiImplementationAddress": "0xd16c2c5d73f5f0fad2272190d3a7739c2faaf2c4",
  "gasSubsidyAddress": "0xCcf93d2Af6a0Bc8BF4e16813B231AC25a8278eE5",
  "gasSubsidyDeployedBlockNumber": 56285751,
  "gasSubsidyImplementationAddress": "0x5b6d29ccf559115cd8d32315ee1754a6c8b93d89",
  "nodeLicenseAddress": "0x04c563Fe78E710dCd96cc5aC538F31afac999e0C",
  "nodeLicenseDeployedBlockNumber": 56285794,
  "nodeLicenseImplementationAddress": "0x624f8270935fafcc06631449f28864d0b7151e59",
  "refereeAddress": "0xc17291398Aa8C13F51401BE04e6E07510ed0Bb68",
  "refereeDeployedBlockNumber": 56285768,
  "refereeImplementationAddress": "0x853055d105f8fd6a8fb0049713ab03b3be82eae7",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0xcC985005Ba287de605e837947f5FE2712e8a4651",
  "xaiDeployedBlockNumber": 56285726,
  "xaiImplementationAddress": "0x0d098de34a26bdca4aa42c73628587388c0eb529"
};

export function setConfig(_config: any) { config = _config; }