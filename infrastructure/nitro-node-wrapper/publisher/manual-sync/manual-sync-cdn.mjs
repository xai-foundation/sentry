import fs from 'fs';
import { Bucket, Storage } from "@google-cloud/storage";
import { loadNodeCreatedEvents } from "./loadNodeCreatedEvents.mjs"
require('dotenv').config()

// create an instance of the bucket
const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
        client_email: process.env.SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
});

const CLOUD_STORAGE_BUCKET = new Bucket(storage, process.env.BUCKET_NAME)

const uploadToBucket = async (jsonSave) => {

    const fileName = `${jsonSave.confirmHash}.json`;
    const localPath = `./${fileName}`;
    const destinationPath = `assertions/${fileName}`;

    const exists = await CLOUD_STORAGE_BUCKET.file(destinationPath).exists();
    if (exists.length && exists[0] == true) {
        console.info("Skipping duplicate assertion", jsonSave.assertion, jsonSave.blockHash);
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


const main = async () => {

    const LATEST_NODE_TO_SYNC_FROM = 4894;

    let foundAssertions;
    try {
        foundAssertions = await loadNodeCreatedEvents(LATEST_NODE_TO_SYNC_FROM)
    } catch (error) {
        console.error("Failed to load assertions from events", error);
        throw new Error("Failed to load assertions from events")
    };

    for (let i = 0; i < foundAssertions.length; i++) {
        const jsonSave = foundAssertions[i];

        const link = await uploadToBucket(jsonSave);
        if (link) {
            console.log("Posted new confirmed assertion", jsonSave, link);
        }
    }
}

main()
    .catch(err => {
        console.error("Error executing main: ", err)
    })