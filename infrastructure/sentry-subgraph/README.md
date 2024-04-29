# Sentry Subgraph 

## Requirements

Install `nx` with `pnpm i -g nx`

Optional: Install nx extension for IDE

Run to initialize current version with `pnpm run codegen` and `pnpm run build`

For the project `sentry-client-desktop`
Update to the latest `endpoint` within the `.graphclientrc.yml` file
Update the `tsconfig.json` module and target to `"module": "commonjs"` `"target": "esnext"` and remove `"moduleResolution": "Node"`

## Add new Contracts

- Add the `Abi` as a `json` file of the new contract into the folder `sentry-subgraph/abis/[newContractAbi].json`

- Create the `.graphql` file with the name `[contract].graphql` and create Event types

- Add the new contract into the `subgraph.yaml` file. Make sure to get the correct address of the deployed contract

- Run `pnpm run codegen` and `pnpm run build` for `sentry-subgraph`. The new `.graphql` file should now be included in the `schema.graphql` file
