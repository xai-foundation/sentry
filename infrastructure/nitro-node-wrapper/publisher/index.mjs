import Docker from "dockerode";
import axios from 'axios';
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

function _tryParseJSONObject(jsonString) {
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    } catch (e) { }
    return null;
};

const _getSendRoot = async (blockHash) => {
    try {
        const response = await axios.post(`http://${DOCKER_CONTAINER_NAME}:8547/rpc`, {
            jsonrpc: '2.0',
            method: 'eth_getBlockByHash',
            params: [blockHash, false], // Set to false if you don't need full transaction details
            id: 1
        });

        return response.data.result.sendRoot;
    } catch (error) {
        console.error('Error in loading block info to get sendRoot', error);
        throw new Error('Error in loading block info to get sendRoot')
    }

}

const onNewAssertion = async (json) => {

    const sendRoot = await _getSendRoot(json.blockHash);

    // Create the confirm hash
    const concatenatedHashes = concat([json.blockHash, sendRoot]);
    const confirmHash = keccak256(concatenatedHashes);

    // create a JSON object that will get saved to the bucket
    const jsonSave = {
        assertion: json.node,
        blockHash: json.blockHash,
        sendRoot: sendRoot,
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
        if (json.hasOwnProperty('blockHash') && json.hasOwnProperty('msg') && json['msg'] == "found correct assertion") {
            onNewAssertion(json);
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

const setupDockerContainerListener = async () => {

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

    // TODO handle errors in here
    // Attach the stdout and stderr to custom streams
    container.attach({ stream: true, stdout: true, stderr: true }, function (err, stream) {
        // Dockerode may demultiplex attach streams for you :)
        container.modem.demuxStream(stream, dockerContainerOutputHandler, dockerContainerOutputHandler);
    });

    console.log('Publisher started successfully, listening on container logs');
}


const uploadToBucket = async (jsonSave) => {

    const fileName = `${jsonSave.confirmHash}.json`;
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
                contentType: "application/plain",
            }
        });
        fs.unlinkSync(localPath);
        return result[0].metadata.mediaLink;

    } catch (error) {
        console.error("Error posting to bucket", error);
        throw new Error(error.message);
    }
}

setupDockerContainerListener()
    .catch(err => {
        console.error("Error on runtime", err);
    })