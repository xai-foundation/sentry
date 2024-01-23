## XAI public node publisher

A Javascript runtime that reads from a local XAI Node and publishes assertions to a GBucket.

### Create & Publish the image

- `docker login`
- `docker build -t <DOCKER_REPO>/xai-public-node-publisher:latest .`
- `docker tag <DOCKER_REPO>/xai-public-node-publisher:latest <DOCKER_REPO>/xai-public-node-publisher:latest`
- `docker push <DOCKER_REPO>/xai-public-node-publisher:latest`