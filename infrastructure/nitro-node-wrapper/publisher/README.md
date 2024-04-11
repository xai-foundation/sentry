## XAI public node publisher

A Javascript runtime that reads from a local XAI Node and publishes assertions to a GBucket.

### Create & Publish the image

- `docker build -t xaidevelopment/xai-node:latest .`
- `docker tag xaidevelopment/xai-node:latest xaidevelopment/xai-node:latest`
- `docker push xaidevelopment/xai-node:latest`