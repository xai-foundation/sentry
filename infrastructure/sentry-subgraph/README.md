# Sentry Subgraph 

## Requirements

Run to initialize current version with `pnpm run codegen` and `pnpm run build`

For the project `sentry-client-desktop`
Update to the latest `endpoint` within the `.graphclientrc.yml` file
Update the `tsconfig.json` module and target to `"module": "commonjs"` `"target": "esnext"` and remove `"moduleResolution": "Node"`

## Add new Contracts

- Add the `Abi` as a `json` file of the new contract into the folder `sentry-subgraph/abis/[newContractAbi].json`

- Create the `.graphql` file with the name `[contract].graphql` and create Event types

### [Be aware callHandlers are not implemented with the arbitrum network](https://thegraph.com/docs/en/developing/creating-a-subgraph/#call-handlers)

- Add the new contract, updated events, entities, handlers and starting blocknumber into the `subgraph.yaml` file. Make sure to get the correct address of the deployed contract

- Run `pnpm run codegen` and `pnpm run build` for `sentry-subgraph`. The new `.graphql` file should now be included in the `schema.graphql` file

## Deployment

- Deploy to alchemy with cli command (Need to be in the same dir as `subgraph.yaml`)
- Make sure to use the correct project name und version for the deployment within the cli command
- `sentry-subgraph-client` Test locally by updating the current api of the deployment in `.graphclientrc.yaml`
- `sentry-subgraph-client` `pnpm run clean`, `pnpm run build`, and `pnpm run dev`

### [Documentation for data mapping / entity creation](https://thegraph.com/docs/en/developing/creating-a-subgraph/#writing-mappings)

## Debug

For debuging `log` needs to be imported from `@graphprotocol/graph-ts` 
Use `log.warning()` to debug as the alchemy UI for logs is very slow to show debug logs