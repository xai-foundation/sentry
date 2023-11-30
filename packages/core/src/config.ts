export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://frequent-damp-star.arbitrum-goerli.quiknode.pro/c1b565106ebecad49a9e7a938d084543187755e4/",
  "esXaiAddress": "0x98EA273917d951b38B8E442d734Fc86fcc61575c",
  "esXaiDeployedBlockNumber": 57317831,
  "esXaiImplementationAddress": "0x1050bcb86e9c5df844a00907042c6073326e2e35",
  "gasSubsidyAddress": "0x9922d0104226374a4291df7F14f1f0753509c31e",
  "gasSubsidyDeployedBlockNumber": 57317836,
  "gasSubsidyImplementationAddress": "0x85d0d1db6815aef063246915b55763b5f0ab7c92",
  "nodeLicenseAddress": "0x926dF5f4ac64ff746317cFaF8091570C9F0ad02A",
  "nodeLicenseDeployedBlockNumber": 57317892,
  "nodeLicenseImplementationAddress": "0x79582bc98350760d1d54e29f62827a4dda37257f",
  "refereeAddress": "0x0348E8517A757e2E7D7a0CFba12535A80FFFC9FD",
  "refereeDeployedBlockNumber": 57317853,
  "refereeImplementationAddress": "0xcdaa5fd29b2484f1c6fa41a707ff9cc114997120",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x55792190ce8De50Ec5a5b5c1B0b904c96c3D3358",
  "xaiDeployedBlockNumber": 57317815,
  "xaiImplementationAddress": "0x9ee2103d3684915029ae3bf5a1169133822d368c"
};

export function setConfig(_config: any) { config = _config; }