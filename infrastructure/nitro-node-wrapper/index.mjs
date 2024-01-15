import Docker from "dockerode";
import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import { concat, keccak256 } from "ethers";
import { Bucket, Storage } from "@google-cloud/storage";

// create an instance of the bucket
// storage = new Storage({
//     projectId: process.env.PROJECT_ID,
//     credentials: {
//         client_email: process.env.SERVICE_ACCOUNT_EMAIL,
//         private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     }
// });
// storage.Bucket(process.env.BUCKET_NAME)

const DOCKER_IMAGE = 'offchainlabs/nitro-node:v2.1.0-72ccc0c';

const DOCKER_CONTAINER_NAME = 'xai-public-node';
const CONFIG_TEMPLATE = 'goerli.config.tpl.json';

const PATH_TO_NODE_CONFIG_DIR = "./arbitrum";
const PATH_TO_NODE_CONFIG = path.join(PATH_TO_NODE_CONFIG_DIR, "config.json");


const createNodeConfig = () => {
    // configure a config for the docker container
    const config = JSON.parse(fs.readFileSync(path.join("./templates", CONFIG_TEMPLATE)));
    config.chain["info-json"] = JSON.stringify(config.chain["info-json"]);

    // Check if the directory exists, if not create it
    if (!fs.existsSync(PATH_TO_NODE_CONFIG)) {
        fs.mkdirSync(PATH_TO_NODE_CONFIG, { recursive: true, p });
    }
    fs.writeFileSync(PATH_TO_NODE_CONFIG, JSON.stringify(config, null, 2));
    console.log("Config created");
}


function _tryParseJSONObject(jsonString) {
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    } catch (e) { }
    return null;
};

//Helper function for the assertion state object, which currently is not a valid JSON object
function _parseStateObject(stateStringObj) {
    let parsed = _tryParseJSONObject(stateStringObj);
    if (parsed == null) {
        // Adding double quotes around the keys
        stateStringObj = stateStringObj.replace(/(\w+):/g, '"$1":');
        // Adding double quotes around the hex values
        stateStringObj = stateStringObj.replace(/(0x[a-fA-F0-9]+)/g, '"$1"');
        // Replace space with commas
        stateStringObj = stateStringObj.trim().replace(/ /g, ',');
        return _tryParseJSONObject(stateStringObj)
    }
}


const onNewAssertion = (json) => {
    const state = _parseStateObject(json.state);

    if (state === null) {
        console.error("Failed to parse state object", json.state);
        return;
    }

    // Concatenate the blockHash and sendRoot
    const concatenatedHashes = concat([state.BlockHash, state.SendRoot]);

    // Create the confirm hash by keccak256
    const confirmHash = keccak256(concatenatedHashes);

    // create a JSON object that will get saved to the bucket
    // TODO save object to google bucket storage
    const jsonSave = {
        assertion: json.assertion,
        blockHash: state.BlockHash,
        sendRoot: state.SendRoot,
        confirmHash,
    }
}

const onJSONLog = (json) => {
    if (json.hasOwnProperty('err')) {
        console.error(json);
        //TODO this could be an error that stops the container, we should handle it appropriately - maybe check the error and restart the whole script
    } else {
        console.log(json);

        // if there is an assertion and a state field then this means the validator has found a stateRoot we should process
        if (json.hasOwnProperty('assertion') && json.hasOwnProperty('state')) {
            onNewAssertion();
        }
    }
}

const dockerContainerOutputHandler = new Writable({
    async write(chunk, encoding, callback) {
        const out = chunk.toString('utf8');

        // Split the output by new lines
        const potentialJsons = out.split(/\n/);

        for (const potentialJson of potentialJsons) {
            const json = _tryParseJSONObject(potentialJson);

            if (json !== null) {

                onJSONLog(json);

            } else if (potentialJson.trim() !== '') {
                console.info(potentialJson);
            }
        }

        callback();
    }
});

const setupDockerContainer = async () => {
    // Create an instance of Docker runtime
    // const docker = new Docker({ socketPath: '/var/run/docker.sock' });
    const docker = new Docker();

    // Pull the docker container for the nitro node
    // This will not await the full image pull, this needs to be fixed
    await docker.pull(DOCKER_IMAGE);

    // Stop all running containers of the specified image and our specific name
    // No two arb-nodes should be running at the same time in here !
    const containers = await docker.listContainers({ all: true });
    for (const containerInfo of containers) {
        if (containerInfo.Image === DOCKER_IMAGE || containerInfo.Names.includes("/" + DOCKER_CONTAINER_NAME)) {
            try {
                await docker.getContainer(containerInfo.Id).stop();
            } catch (error) {
                if (!JSON.stringify(error).includes("container already stopped")) {
                    throw new Error("Failed to stop container", error);
                }
            }

            await docker.getContainer(containerInfo.Id).remove();
        }
    }

    // Create the docker container
    const container = await docker.createContainer({
        Image: DOCKER_IMAGE,
        name: DOCKER_CONTAINER_NAME,
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

    // Attach the stdout and stderr to custom streams
    container.attach({ stream: true, stdout: true, stderr: true }, function (err, stream) {
        // Dockerode may demultiplex attach streams for you :)
        container.modem.demuxStream(stream, dockerContainerOutputHandler, dockerContainerOutputHandler);
    });

    // Start the docker container
    await container.start();
    console.log('Docker container started successfully');
}

const main = () => {
    createNodeConfig();
    setupDockerContainer()
        .catch(err => {
            console.error("Error on runtime", err);
            console.log("Restarting...");
            main();
        })
}
main();