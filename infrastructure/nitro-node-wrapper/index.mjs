import Docker from "dockerode";
import fs from 'fs';
import { Writable } from 'stream';
import ethers from "ethers";
import {Bucket, Storage} from "@google-cloud/storage";

// create an instance of the bucket
storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
        client_email: process.env.SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
});
storage.Bucket(process.env.BUCKET_NAME)

// configure a config for the docker container
const config = {
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
};

// Check if the directory exists, if not create it
if (!fs.existsSync('./arbitrum/')) {
    fs.mkdirSync('./arbitrum/', { recursive: true });
}
fs.writeFileSync('./arbitrum/config.json', JSON.stringify(config, null, 2));

// Create an instance of Docker runtime
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Pull the docker container for the nitro node
const image = await docker.pull('offchainlabs/nitro-node:v2.1.0-72ccc0c');

// Stop all running containers of the specified image
const containers = await docker.listContainers();
for (const containerInfo of containers) {
    if (containerInfo.Image === 'offchainlabs/nitro-node:v2.1.0-72ccc0c') {
        await docker.getContainer(containerInfo.Id).stop();
    }
}

// Create the docker container
const container = await docker.createContainer({
    Image: 'offchainlabs/nitro-node:v2.1.0-72ccc0c',
    Cmd: ['--conf.file', '/home/user/.arbitrum/config.json', '--metrics', '--ws.port=8548', '--ws.addr=0.0.0.0', '--ws.origins=*'],
    Tty: false,
    ExposedPorts: {
        '8547/tcp': {},
        '8548/tcp': {},
        '9642/tcp': {}
    },
    HostConfig: {
        Binds: [
            `${process.cwd()}/arbitrum:/home/user/.arbitrum`,
            `${process.cwd()}/data:/home/user/data:delegated`
        ],
        PortBindings: {
            '8547/tcp': [{ HostPort: '8547' }],
            '8548/tcp': [{ HostPort: '8548' }],
            '9642/tcp': [{ HostPort: '9642' }]
        }
    }
});

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const stdOut = new Writable({
  async write(chunk, encoding, callback) {
    const out = chunk.toString('utf8');
    
    // Split the output by new lines
    const potentialJsons = out.split(/\n/);

    for (const potentialJson of potentialJsons) {
        if (potentialJson.trim() !== '' && isJsonString(potentialJson)) {
            const json = JSON.parse(potentialJson);
            if (json.hasOwnProperty('err')) {
                console.error(json);
            } else {
                console.log(json);

                // if there is an assertion and a state field then this means the validator has found a stateRoot we should process
                if (json.hasOwnProperty('assertion') && json.hasOwnProperty('state') && isJsonString(json.state)) {
                    const state = JSON.parse(json.state);

                    // Concatenate the blockHash and sendRoot
                    const concatenatedHashes = ethers.hexConcat([state.BlockHash, state.SendRoot]);

                    // Create the confirm hash by keccak256
                    const confirmHash = ethers.keccak256(concatenatedHashes);

                    // create a JSON object that will get saved to the bucket
                    const jsonSave = {
                        assertion: json.assertion,
                        blockHash: state.BlockHash,
                        sendRoot: state.SendRoot,
                        confirmHash,
                    }
                }
            }
        } else if (potentialJson.trim() !== '') {
            console.info(potentialJson);
        }
    }

    callback();
  }
});

// Attach the stdout and stderr to custom streams
container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    // Dockerode may demultiplex attach streams for you :)
    container.modem.demuxStream(stream, stdOut, stdOut);
});

// Start the docker container
await container.start();

console.log('Docker container started successfully');
