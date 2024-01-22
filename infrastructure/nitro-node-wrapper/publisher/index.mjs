import Docker from "dockerode";
import fs from 'fs';
import { Writable } from 'stream';
import { concat, keccak256 } from "ethers";
import { Bucket, Storage } from "@google-cloud/storage";

// create an instance of the bucket
const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
        client_email: process.env.SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
});

const CLOUD_STORAGE_BUCKET = new Bucket(storage, process.env.BUCKET_NAME)
const DOCKER_CONTAINER_NAME = 'xai-public-node';


// const CONFIG_TEMPLATE = 'xai-goerli.config.tpl.json';
// const CONFIG_TEMPLATE = 'xai-mainnet.config.tpl.json';

// const PATH_TO_NODE_CONFIG_DIR = `${process.cwd()}/arbitrum`;
// const PATH_TO_NODE_CONFIG = path.join(PATH_TO_NODE_CONFIG_DIR, "config.json");

// //TODO we should remove this and have the actual config in the github or in the docker image
// const createNodeConfig = () => {
//     // configure a config for the docker container
//     const config = JSON.parse(fs.readFileSync(path.join("./templates", CONFIG_TEMPLATE)));
//     config.chain["info-json"] = JSON.stringify(config.chain["info-json"]);

//     // Check if the directory exists, if not create it
//     if (!fs.existsSync(PATH_TO_NODE_CONFIG_DIR)) {
//         fs.mkdirSync(PATH_TO_NODE_CONFIG_DIR, { recursive: true });
//     }
//     fs.writeFileSync(PATH_TO_NODE_CONFIG, JSON.stringify(config, null, 2));
//     console.log("Config created");
// }


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


const onNewAssertion = async (json) => {
    const state = _parseStateObject(json.state);

    if (state === null) {
        console.error("Failed to parse state object", json.state);
        return;
    }

    console.log("Has new assertion");

    // Concatenate the blockHash and sendRoot
    const concatenatedHashes = concat([state.BlockHash, state.SendRoot]);

    // Create the confirm hash by keccak256
    const confirmHash = keccak256(concatenatedHashes);

    // create a JSON object that will get saved to the bucket
    // TODO save object to google bucket storage!
    const jsonSave = {
        assertion: json.assertion,
        blockHash: state.BlockHash,
        sendRoot: state.SendRoot,
        confirmHash,
    }

    //TODO retry if upload failed / send error notification
    const link = await uploadToBucket(jsonSave);
    if (link) {
        console.log("Posting new confirmed assertion", jsonSave, link);
    }
}

const onJSONLog = (json) => {
    if (json.hasOwnProperty('err')) {
        console.error("Node container had error:", json);
        //TODO this could be an error that stops the container, we should handle it appropriately - maybe check the error and restart the whole script
    } else {

        console.log("New container JSON log", json);
        // if there is an assertion and a state field then this means the validator has found a stateRoot we should process
        if (json.hasOwnProperty('assertion') && json.hasOwnProperty('state')) {
            onNewAssertion(json);
        }
    }
}

const getAssertionsFromContainerLogs = async (container, since) => {
    //TODO this is not working correctly, its not using the since param and returns the fist 50 logs since container start
    const logs = await container.logs({ stdout: true, stderr: true, timestamps: true, since });
    // TODO get assertions from log
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

    const docker = new Docker();
    let container;

    try {
        const containers = await docker.listContainers({ all: true });
        for (const containerInfo of containers) {
            if (containerInfo.Names.includes("/" + DOCKER_CONTAINER_NAME)) {
                container = docker.getContainer(containerInfo.Id);
                break;
            }
        }

    } catch (error) {
        console.error("Error listing docker container", error);
        throw new Error("Error listing container");
    }

    if (!container) {
        throw new Error("Did not find container " + DOCKER_CONTAINER_NAME);
    }

    try {
        //TODO get timestamp from last log
        const lastContainerLog = Date.now() - (60 * 60 * 1000);
        const assertionsFromLogs = await getAssertionsFromContainerLogs(container, lastContainerLog);
        //TODO Post missed assertions
    } catch (error) {
        console.error("Failed to load recent container logs - continue with current stream", error);
    }

    // TODO handle errors in here ?
    // Attach the stdout and stderr to custom streams
    container.attach({ stream: true, stdout: true, stderr: true }, function (err, stream) {
        // Dockerode may demultiplex attach streams for you :)
        container.modem.demuxStream(stream, dockerContainerOutputHandler, dockerContainerOutputHandler);
    });

    console.log('Publisher started successfully, listening on container logs');
}


const uploadToBucket = async (jsonSave) => {

    const fileName = `${jsonSave.blockHash}.json`;
    const localPath = `./${fileName}`;
    const destinationPath = `assertions/${fileName}`;

    const exists = await CLOUD_STORAGE_BUCKET.file(destinationPath).exists();
    if (exists.length && exists[0] == true) {
        console.info("Skipping duplicate assertion", jsonSave.blockHash);
        return null;
    }

    fs.writeFileSync(localPath, JSON.stringify(jsonSave, null, 2));

    try {
        const result = await CLOUD_STORAGE_BUCKET.upload(localPath, {
            destination: destinationPath,
            public: true,
            metadata: {
                contentType: "application/plain", //application/csv for excel or csv file upload
            }
        });
        fs.unlinkSync(fileName);
        return result[0].metadata.mediaLink;

    } catch (error) {
        console.error("Error posting to bucket", error);
        throw new Error(error.message);
    }
}

const main = () => {
    setupDockerContainer()
        .catch(err => {
            console.error("Error on runtime", err);
            //TODO send notification here, container should be restart5ed by docker 
        })
}
main();