#!/bin/bash

# Check if docker is installed
if ! command -v docker &> /dev/null
then
    # Update the package lists for upgrades and new package installations
    sudo apt-get update && 

    # Install Docker
    sudo apt-get install docker.io -y
fi

# Add the user to the docker group
sudo usermod -aG docker ${USER}

# Modify useradd defaults to add new users to the docker group
if grep -q "^GROUP=" /etc/default/useradd; then
    sudo sed -i 's/^GROUP=.*/GROUP=docker/' /etc/default/useradd
else
    echo "GROUP=docker" | sudo tee -a /etc/default/useradd
fi

# Check if the docker image is present
if ! docker image inspect offchainlabs/nitro-node:v2.1.0-72ccc0c &> /dev/null
then
    # Pull the docker image
    docker pull offchainlabs/nitro-node:v2.1.0-72ccc0c
fi

# Check if the directory exists
if [ ! -d "/opt/arbitrum" ]; then
    # Create the directory
    sudo mkdir -p /opt/arbitrum
fi

# Change the owner of the directory to the current user and group
sudo chown -R $(whoami):$(id -gn) /opt/arbitrum

# Change the permissions of the directory so that any user can edit files in it
sudo chmod -R a+rwX /opt/arbitrum

# Check if the docker container is running
if docker ps | grep -q 'offchainlabs/nitro-node:v2.1.0-72ccc0c'; then
    # Stop the docker container
    docker stop $(docker ps -q --filter ancestor=offchainlabs/nitro-node:v2.1.0-72ccc0c)
fi

# Create a JSON file with the configuration parameters
cat > /opt/arbitrum/config.json <<EOF
{
    "chain": {
        "id": 47279324479,
        "info-json": "[{\"chain-id\":47279324479,\"parent-chain-id\":421613,\"chain-name\":\"Xai Orbit Testnet\",\"chain-config\":{\"chainId\":47279324479,\"homesteadBlock\":0,\"daoForkBlock\":null,\"daoForkSupport\":true,\"eip150Block\":0,\"eip150Hash\":\"0x0000000000000000000000000000000000000000000000000000000000000000\",\"eip155Block\":0,\"eip158Block\":0,\"byzantiumBlock\":0,\"constantinopleBlock\":0,\"petersburgBlock\":0,\"istanbulBlock\":0,\"muirGlacierBlock\":0,\"berlinBlock\":0,\"londonBlock\":0,\"clique\":{\"period\":0,\"epoch\":0},\"arbitrum\":{\"EnableArbOS\":true,\"AllowDebugPrecompiles\":false,\"DataAvailabilityCommittee\":true,\"InitialArbOSVersion\":10,\"InitialChainOwner\":\"0x9eA24417Ee7722e7EFaf87d2D68d4bC6b41231F7\",\"GenesisBlockNum\":0}},\"rollup\":{\"bridge\":\"0xf958e56d431eA78C7444Cf6A6184Af732Ae6a8A3\",\"inbox\":\"0x8b842ad88AAffD63d52EC54f6428fb7ff83060a8\",\"sequencer-inbox\":\"0x5fD0cCc5D31748A44b43cf8DFBFA0FAA32665464\",\"rollup\":\"0x082742561295f6e1b43c4f5d1e2d52d7FfE082f1\",\"validator-utils\":\"0x32E35dBDCC3558F6A0f7c3af6B13380FC3E6ce97\",\"validator-wallet-creator\":\"0x237aed14AEA28032B12A389590875Ed8d1D12811\",\"deployed-at\":32449497}}]",
        "name": "Xai Orbit Testnet"
    },
    "conf": {
        "env-prefix": "NITRO"
    },
    "http": {
        "addr": "0.0.0.0",
        "api": [
            "eth",
            "net",
            "web3",
            "arb",
            "debug"
        ],
        "corsdomain": "*",
        "port": 8547,
        "rpcprefix": "/rpc",
        "vhosts": "*"
    },
    "log-type": "json",
    "metrics": true,
    "metrics-server": {
        "addr": "0.0.0.0",
        "port": 6070
    },
    "node": {
        "caching": {
            "archive": true
        },
        "data-availability": {
            "enable": true,
            "parent-chain-node-url": "https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/",
            "request-timeout": "5s",
            "rest-aggregator": {
                "enable": true,
                "urls": [
                    "https://testnet-das-mirror.xai-chain.net/"
                ],
                "wait-before-try-next": "2s"
            },
            "sequencer-inbox-address": "0x5fD0cCc5D31748A44b43cf8DFBFA0FAA32665464"
        },
        "feed": {
            "input": {
                "reconnect-initial-backoff": "50ms",
                "reconnect-maximum-backoff": "800ms",
                "timeout": "10s",
                "url": "wss://testnet.xai-chain.net/feed"
            }
        },
        "forwarding-target": "https://testnet.xai-chain.net/rpc/",
        "rpc": {
            "tx-fee-cap": 0
        },
        "tx-lookup-limit": 0
    },
    "parent-chain": {
        "connection": {
            "url": "https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/"
        },
        "id": 421613
    },
    "persistent": {
        "chain": "/home/user/data/"
    },
    "pprof": true,
    "pprof-cfg": {
        "addr": "0.0.0.0",
        "port": "6071"
    },
    "ws": {
        "addr": "0.0.0.0",
        "api": [
            "net",
            "web3",
            "eth",
            "arb"
        ],
        "port": 8548,
        "rpcprefix": "/ws",
        "origins": "*"
    }
}
EOF

# Run the docker container with the configuration file
docker run --rm -v /opt/arbitrum:/home/user/.arbitrum -p 0.0.0.0:8547:8547 -p 0.0.0.0:8548:8548 -p 0.0.0.0:9642:9642 offchainlabs/nitro-node:v2.1.0-72ccc0c --conf.file /home/user/.arbitrum/config.json --metrics --ws.port=8548 --ws.addr=0.0.0.0 --ws.origins=*
