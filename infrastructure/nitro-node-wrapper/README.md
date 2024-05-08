# XAI Public Node

The XAI public node should functions as a backup for posting the assertions to a public CDN

The XAI Mainnet node needs a Arb1 Node to sync from. THis can either be a public / third party RPC or a Arb1 Nitro node

In this setup we run a Arb1 Nitro node and use its RPC for the XAI mainnet node.
Since the XAI mainnet node can only sync from a already synced Arb1 node, we use a public RPC until the Arb1 Node is fully synced.

Make sure the ENV variables are set either on the machine or by providing a .env file in the dir where the docker-compose.yml is stored (/opt/node/build)

An example of the needed variables is in example.env


## Important notice

Stop the containers gently by using a delay

- `docker stop --time=300 $(docker ps -aq)`