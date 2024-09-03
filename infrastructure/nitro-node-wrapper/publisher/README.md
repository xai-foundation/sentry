## XAI public node publisher

A Javascript runtime that reads from a local XAI Node and publishes assertions to a GBucket.

## Local development

### Requirements

- Node & npm
- Docker (for the publisher runtime)
- Google bucket credentials for reading / writing to storage

- `npm install`
- `npm run start` to start the publisher runtime
- `npm run manual-sync` to start the manual sync (will sync to assertion id `LATEST_NODE_TO_SYNC_FROM`)

## Create & Publish the image

- `docker build -t xaidevelopment/xai-node:latest .`
- `docker tag xaidevelopment/xai-node:latest xaidevelopment/xai-node:latest`
- `docker push xaidevelopment/xai-node:latest`