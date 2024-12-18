# XAI Infrastructure

## Introduction

The XAI infrastructure is built in [Sentry Node Monorepo xai-foundation/sentry](https://github.com/xai-foundation/sentry)

This monorepo holds the following packages:

- apps
  - CLI: User cli for running an operators node. It also has functions  for data syncing runtimes and the challenger runtime.
  - Sentry Client Desktop App: User interface for running an operator node
  - Web-Connect: this is the Sentry website that hosts the Key Sale page for Node Licenses as well as blockchain interactions for key holder / operator setup
  - Web-Staking: this is the website for the Staking Application, it displays pools, reward rates, and allows users to interact with pools
- infrastructure
  - gcp-nitro-node: Terraform setup for the public node host on google cloud
  - nitro-node-wrapper: Public node stack config and custom publisher software
  - smart-contracts: ecosystem smart contract infrastructure, deployment / upgrade scripts and tests
  - sentry-subgraph: subgraph schemas and syncing scripts, subgraphs will be deployed from here
- packages
  - core: shared libraries like operatorRuntime and blockchain & subgraph interactions
  - ui: shared ui components for web-connect, web-staking and desktop app
  - sentry-subgraph-client: graphprotocol client, used in core for TS support of subgraph entities and used for a dev playground UI

## Development cycle

- Feature branches for epics will be created on the production repo (`xai-foundation/sentry`) (this requires write access on that repo).
- PRs get created on `xai-foundation/sentry/:working-branch` back into `xai-foundation/sentry/develop`
- Every PR links to its story and has a description on
  - What has been done
  - How has it been tested
- Every story links to it's PR for it to be marked as finished
- Once the PR is approved the PR requester will merge the PR
- After merge the requester needs to deploy for testing, this can be pushing a tag for creating a release build or pushing a branch to trigger the cloud build (see "Deployments & Releases). Not all PRs will follow the same deployment strategy, this should be discussed for each story before starting any updates
- Once deployed mark the story as delivered and add info for testing to the story

## Local development

[NX](https://nx.dev/features/run-tasks) can be used for local script management.

Run the different apps by their commands in the root's `package.json` like

- `pnpm clean` (!) to delete all release / build artifacts
- `pnpm cli` for running the CLI
- `pnpm web` for running sentry-xai.games locally
- `pnpm desktop` for running the desktop app locally

For local release building and signing SSL.com access is requires. Currently the credentials are set in the github secrets.

A local release and a github release can be created without signing the release.
More information about the signing can be found in the desktop app readme.

---------------------------------

# Deployments & Releases

## Staging Environments and develop releases

### Operator & CLI

- Run the github action `Create Signed Test Release` or `Create Unsigned Test Release` (Note: windows signing costs per signing requests / month) this will upload the release as workflow artifacts for testing. They will be automatically deleted after 30 days !


### Key-sale page (web-connect)

- Run the github action `Deploy Web Connect`, set `Cloudflare project to deploy to` to **`sentry-develop`** **(!)**. This will deploy the app to the develop env.

### Staking App (web-staking)

- Push a tag with the prefix `web-staking` **AND the postfix** `develop.{v}` like `web-staking-1.0.0-develop.1`. This will deploy to the develop environment.

Local development requires a local mongoDB instance or access to the develop mongoDB used for develop.app.xai.games.
A local mongoDB can be synced by running the CLI cmd `sync-staking-pools` with the local mongoDB URI locally using `toggle-switch-network` command first.
The cloud build, build trigger and develop mongoDB is configured, deployed and maintained by the Services Team.

#### Setup local development for web-staking:
1. Create a `.env` file
2. Set the `NEXT_PUBLIC_APP_ENV=development` in the .env
3. Set the `MONGODB_URL=mongodb://127.0.0.1:27017/xai-app`
    * note: if you have not "prepopulated" your local mongoDb, you need to do that next.
    * For syncing testnet data ensure the current config file in packages/core/src/config.json is the Sepolia config file.
    * Prepopulate mongoDb by starting the CLI and running the `sync-staking-pools` command.


### Sentry Subgraph

**IMPORTANT: Always push a tag to mark your subgraph deploy until this is automated !** `subgraph-deploy-{version}` where version is the deployed version on Alchemy

Sentry graph is deployed and hosted by alchemy https://subgraphs.alchemy.com/dashboard (Alchemy access required).
The sepolia graphs are in `sentry-sepolia` https://subgraphs.alchemy.com/subgraphs/6221

Run the alchemy deploy command in `infrastructure/sentry-subgraph` to deploy a new subgraph with a specific version.

For local testing the subgraph endpoint needs to be updated in `packages\sentry-subgraph-client\.graphclientrc.yml` and launched to a local playground by running `pnpm dev` in `packages\sentry-subgraph-client`.

```
DEPRECATED

Build and deploy from the local machine in `infrastructure/sentry-subgraph` with `pnpm codegen`, `pnpm build` and the deployment cmd from the alchemy subgraph page. The sepolia sync has sepolia contract specific logic for managing Poolfactory and Referee versions as well as reducing the submissions entity count since sepolia has more challenges than one every hour during specific testing time frames. Sepolia deploys that sync should be done from `xai-foundation/sentry-development:subgraph-sepolia-sync` or a local branch off `xai-foundation/sentry-development:subgraph-sepolia-sync`. `xai-foundation/sentry-development:subgraph-sepolia-sync` needs to be kept up to date with sync script updates.
```


### Smart contracts

All Xai ecosystem smart contracts are in `infrastructure/smart-contracts`, the deployments are managed through hardhat.

Sepolia contracts can be deployed & upgraded with the sepolia deployer `0x490A5C858458567Bd58774C123250de11271f165` (Private Key required)
The `develop` branch should match what is deployed on testnet.
In the future, this should be automated and run through a github action.

All deployments and upgrades are managed by scripts in `infrastructure/smart-contracts/scripts`.

#### Running the tests

Update the `hardhat.config.cjs`, define the network to use in the `defaultNetwork` set to `hardhat`
In `infrastructure/smart-contracts` run `pnpm local` for running a local node
Some tests will use core function, so core has to be built locally before running the test suite with `pnpm -filter @sentry/core run build`.
Run `pnpm test` to run all tests referenced in `infrastructure\smart-contracts\test\Fixture.mjs`

---------------------------------

## Production Environment

### Operator & CLI


- Run the github action `Operator - Semantic Release and Build`. This will create a new semantic release on github. THIS WILL TRIGGER THE AUTO UPDATE FOR ALL PREVIOUS DESKTOP CLIENTS !

### Key-sale page (web-connect)

- Run the github action `Deploy Web Connect`, set `Cloudflare project to deploy to` to **`sentry`** **(!)**. This will deploy the app to the production env.

This requires write access to `xai-foundation/sentry`


### Staking App (web-staking)

- Push a tag with the prefix `web-staking` like `web-staking-1.0.0`. This will deploy to the production environment.

The cloud build, build trigger and production mongoDB is configured, deployed and maintained by the Services Team.

### Sentry Subgraph

**IMPORTANT: Always push a tag to mark your subgraph deploy until this is automated !** `subgraph-deploy-{version}` where version is the deployed version on Alchemy

Sentry graph is deployed and hosted by alchemy https://subgraphs.alchemy.com/dashboard (Alchemy access required).

The production graphs are in `sentry` https://subgraphs.alchemy.com/subgraphs/4740

Build and deploy from the local machine in `infrastructure/sentry-subgraph` with `pnpm codegen`, `pnpm build` and the deployment cmd from the alchemy subgraph page.

### Smart contracts

All Xai ecosystem smart contracts are in `infrastructure/smart-contracts`, the deployments are managed through hardhat.

Production contracts can be deployed & upgraded with the production deployer `0x7C94E07bbf73518B0E25D1Be200a5b58F46F9dC7` (Private Key required)
The current sepolia infrastructure is deployed from `xai-foundation/sentry:master`

### Public Node

The public node functions as an additional source of truth, its a xai-mainnet node that will publish Xai assertion block-hashes to a google cloud bucket CDN.
It consists of 3 docker containers:

- Xai Mainnet node used to read assertions from
- Arbitrum-One Nitro node used for the parent layer RPC for the xai node
- Publisher, a javascript runtime that reads the xai-node container logs and posts assertions data to the CDN

The public node can be setup on any host with enough resources to run two arbitrum nodes. The host setup can be done through terraform. The configs needed are in `infrastructure\nitro-node-wrapper`, the publisher javascript runtime at `infrastructure\nitro-node-wrapper\publisher\index.mjs` 

Specific environment variables have to be provided in a `.env`:
```
# Arb1 Node Settings
# The Etehreum mainnet RPC to sync the ARB1 node with (prob > 100K requests to sync)
ETH_RPC_URL= 

# GBUCKET Project ID
PROJECT_ID=
# GBUCKET Account Email
SERVICE_ACCOUNT_EMAIL=
# GBUCKET PRIVATE KEY
SERVICE_ACCOUNT_PRIVATE_KEY=
# GBUCKET BUCKET NAME
BUCKET_NAME=xai-sentry-public-node
```

Using the XAI Quicknode ETH RPC - Quicknode access required
Google Cloud Storage `xai-sentry-public-node` access required

Assertions currently get published to the Google Cloud Bucket https://console.cloud.google.com/storage/browser/xai-sentry-public-node/assertions

Currently the public node is setup at https://console.cloud.google.com/compute/instancesDetail/zones/us-east4-b/instances/arbitrum-full-node-us?hl=de&project=xai-watchtower-node (Google Cloud access required for project `xai-watchtower-node`)

**Manage the containers** (needs user to be in docker group or use `sudo`)
- Stop all containers gracefully, in `/opt/public-node/build` `docker stop --time=300 $(docker ps -aq) && docker compose down`
- Restart public-node-stack, in `/opt/public-node/build` `docker compose up -d` (requires .env in directory)
- View logs, in `/opt/public-node/build` `docker compose logs -f -n 100` to view the last 100 logs and follow

The xai node and arb node data will be stored in `/opt/public-node/data`


# Deployed Runtimes

All runtimes are deployed within a [`screen` session](https://www.gnu.org/software/screen/manual/screen.html)
Important screen commands used:

- `screen ls` - view the active screens
- `screen -S <session name>` - Start a new screen session
- `screen -r challenger` - resume a screen session

Within a screen session:

- `CTRL + A, D` - exit a screen session (will keep running in the background)
- `CTRL + A, ESC` - to enter scroll mode, exit scroll mode with `ESC`

IMPORTANT: using `CTRL + C` will exit the running cli command, if that is done in the challenger screen it can only be restarted with the private keys !


## Challenger

The Challenger is one of the main parts to the Sentry-Node assertion and reward process.
Its a cli runtime (`boot-challenger`) that will listen on `NodeConfirmed` EVM events on the XAI Rollup Protocol (deployed on parent layer arbitrum-one).
For every `NodeConfirmed` event the challenger will currently create a challenge (`submitChallenge`) on the Referee contract. This will be the trigger for NodeLicense operators running the sentry-node software to submit assertions to that challenge and claim for the previous.

The sentry CLI running `boot-challenger` on a google cloud compute VM instance 
https://console.cloud.google.com/compute/instances?hl=de&project=xai-sentry-node-challenger

Google Cloud access to project `xai-sentry-node-challenger` required

Running in a `screen` session running the CLI on the VM.
Needs the "challenger" privateKey (`0xc74c1e08963ceef0e1f2f2a2eeb879f443e86836`) and bls privateKey (`0x977f9fe1d570ba7e48ea76566718023b260ed56eba368ff20dca06e99e650804126663c1a5febdb065ef139a0156a9ad`) on startup

## Data sync

The data-sync is a cli runtime (`start-centralization-runtime`) that will listen on blockchain events and trigger a centralized database sync based on the emitted event. It will listen on the PoolFactory for any staking pool update. It will also listen on the Referee `ChallengeSubmitted` event to trigger the pool reward rate calculation. This centralized database will only be used in the staking app for a smoother user experience offering filter sort and search across all the created staking pools.

The sentry CLI running `start-centralization-runtime` on a google cloud compute VM instance
https://console.cloud.google.com/compute/instancesDetail/zones/us-central1-c/instances/backup-runtime?hl=de&project=xai-watchtower-node

This is syncing the mongoDB used for the staking app on events emitted from the PoolFactory as well as updating the staking rewards from subgraph-data on every challenge.

Google Cloud access to project `xai-watchtower-node` required

Each runtime is in it's own docker container. Each container has a `screen` session running that you may connect to in order to interact with the container.

Currently we have one instance for each network:

- arb-data-sync-infura
- sepolia-data-sync

This will be extended for additional containers using different RPCs.

Container image built from Dockerfile in `/opt/arb-data-sync-infura` / `/opt/sepolia-data-sync`

## Backup challenger

Another challenger instance running on the infura RPC.
https://console.cloud.google.com/compute/instancesDetail/zones/us-central1-c/instances/backup-runtime?hl=de&project=xai-watchtower-node

Within docker container running a `screen` session with `boot-challenger` on infura RPCs
Each runtime is in it's own docker container. Each container has a `screen` session running that you may connect to in order to interact with the container.

Container image built from Dockerfile in `/opt/backup-challenger-infura`
