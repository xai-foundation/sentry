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


## MultiSig deployments

### Upgrade an existing proxy to a new implementation

If the beacon proxy admin owner is a multisig we use `upgrades.upgradeProxy` anymore as it will throw the error `Caller is not owner` fro the beacon proxy contract.
For multisig deployments we need to call `upgrades.prepareUpgrade`, then take the implementation and build the transaction on the multisig contract.
If there is an initialize function to be called with the upgrade, we will call `upgradeAndCall` to the beacon proxy contract, this will require sending the encoded function call. For this we have a helper function `./utils/getUpgradeTransactionData.mjs`. It will create the encoded function call data to be sent with the multisig transaction.
From `upgrades.prepareUpgrade` we will get the new implementation address to upgrade to, we have to verify this implementation.

### Deploy a new contract

Deploy a new proxy will use the existing beacon proxy admin contract which is owned by the multisig, this wokrs the same no matter who the beacon proxy admin is.

### How to upgrade using the multisig account

- Login on the multisig webapp
- Create a new transaction (transaction builder)
- Enter Beacon proxy contract address 
  - `0xD88c8E0aE21beA6adE41A41130Bb4cd43e6b1723` ArbitrumOne
  - `0x2b0AE314A4CE6BE6E47a88b758a0b6cD7C143C5A` ArbitrumSepolia
- Enter Beacon proxy ABI
- Select Contract method to call:
  - `upgrade` for upgrades without calling any initializer
  - `upgradeAndCall` for upgrades with calling an initializer or migration function
- Enter proxy address of the contract to upgrade
- Enter the new implementation address (from running `upgrades.prepareUpgrade`)
- When calling `upgradeAndCall` enter the **data** generated from encoding the function signature with the call data (`getUpgradeTransactionData.mjs`)