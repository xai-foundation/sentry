export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "defaultRpcUrl": "https://goerli-rollup.arbitrum.io/rpc/",
  "esXaiAddress": "0x8b5f8AB01801E20bB36c72B496370cF446E202Ec",
  "esXaiDeployedBlockNumber": 54184261,
  "esXaiImplementationAddress": "0x07905bb78792e8dc41472d78fb116be23f365517",
  "gasSubsidyAddress": "0x9E4CA5111f725c40e4C6e6Dde54883cdBe763B58",
  "gasSubsidyDeployedBlockNumber": 54184311,
  "gasSubsidyImplementationAddress": "0x3f37f8f30eb083b3bed88e9c61e3cdb433be10e9",
  "nodeLicenseAddress": "0x6BCEebf43D088Eb615aFf120A96FcA8c3880616D",
  "nodeLicenseDeployedBlockNumber": 54184289,
  "nodeLicenseImplementationAddress": "0xe805ef0cc7c4cf8bf3efdde0725f6706505584e2",
  "refereeAddress": "0x81f3d5Bb9242d9E88B905C16A92bD6a6962c8F43",
  "refereeDeployedBlockNumber": 54184239,
  "refereeImplementationAddress": "0xfb7ad5601d57c07a8ce495b88b77c82e5a97ee12",
  "rollupAddress": "0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1",
  "xaiAddress": "0x318E9df96d57fA8945646b68E65096414F19540d",
  "xaiDeployedBlockNumber": 54184223,
  "xaiImplementationAddress": "0x0bd8ce521e337bc10c3fa891bb68aa411de37941"
};

export function setConfig(_config: any) { config = _config; }