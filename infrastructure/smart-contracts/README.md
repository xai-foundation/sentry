# XAI hardhat deployment

## Requirements

- Create a `.env` file from the `example.env`
- For deploying the whole ecosystem, initial token mints have to be setup by creating `initialXaiMints.csv`
- Remove `.openzeppelin` for a new deploy, this will deploy a new proxy beacon admin contract for upgrades
- Update the `hardhat.config.cjs`, define the network to use in the `defaultNetwork`
- An API key for the chosen network's explorer needs to be set in the `.env` file

## Deploy

- `pnpm run deploy` to deploy the whole XAI ecosystem
  
All deployed contract and their proxy beacon will be persisted in the .openzeppelin directory.
To deploy on a local node start the node with `pnpm run local` and change the `defaultNetwork` to `hardhat` to deploy to the local node.

## Upgrade a contract

- Create the new contract file
- Create an upgrade script (or use an existing one)
- Change the proxy address to the contract that needs to be upgraded
- Change the contract name to the new contract version (`esXai` -> `esXai2`) in ` const esXai2 = await ethers.getContractFactory("esXai2");`
- Create a new upgrade command in `package.json`
- Run the script with `pnpm run upgrade-esxai`