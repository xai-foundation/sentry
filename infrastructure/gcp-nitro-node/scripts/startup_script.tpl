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
sudo usermod -aG docker $(whoami)

# Modify useradd defaults to add new users to the docker group
if grep -q "^GROUP=" /etc/default/useradd; then
    sudo sed -i 's/^GROUP=.*/GROUP=docker/' /etc/default/useradd
else
    echo "GROUP=docker" | sudo tee -a /etc/default/useradd
fi

# Create the node data directories
sudo mkdir -p /opt/arbitrum
sudo mkdir -p /opt/xai
sudo mkdir -p /opt/node/build

# Change the owner of the directory to the current user and group
sudo chown -R $(whoami):$(id -gn) /opt/arbitrum
sudo chown -R $(whoami):$(id -gn) /opt/xai
sudo chown -R $(whoami):$(id -gn) /opt/node/build

# Change the permissions of the directory so that any user can edit files in it
sudo chmod -R a+rwX /opt/arbitrum
sudo chmod -R a+rwX /opt/xai
sudo chmod -R a+rwX /opt/node/build

# Stop all running containers
docker stop --time=300 $(docker ps -aq)
docker rm $(docker ps -aq)

cd /opt/node/build
if [ -f "/opt/node/build/docker-compose.yml" ]; then
    # If we already have a docker-compsoe we will try to remove all containers and delete the outdated versions
    docker compose down
    sudo rm -f docker-compose.yml
    sudo rm -f xai-mainnet.config.json
fi

# Download the current docker compose and xai config
curl -o docker-compose.yml https://storage.googleapis.com/xai-sentry-public-node/node-config/docker-compose.yml
curl -o xai-mainnet.config.json https://storage.googleapis.com/xai-sentry-public-node/node-config/xai-mainnet.config.json

# EPORT ENV VARS
EXPORT BUCKET_NAME=${bucket_name}

docker compose up -d