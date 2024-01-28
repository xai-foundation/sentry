#!/bin/bash

if ! id "tfadmin" &>/dev/null; then
    sudo useradd -m -s /bin/bash tfadmin
    # Set password or SSH keys as appropriate
fi

# Check if docker is installed
if ! command -v docker &> /dev/null
then
    sudo apt-get update
    sudo apt-get install apt-transport-https ca-certificates curl software-properties-common -y
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install docker-ce -y
fi

# Add the user to the docker group
sudo usermod -aG docker tfadmin

# Modify useradd defaults to add new users to the docker group
if grep -q "^GROUP=" /etc/default/useradd; then
    sudo sed -i 's/^GROUP=.*/GROUP=docker/' /etc/default/useradd
else
    echo "GROUP=docker" | sudo tee -a /etc/default/useradd
fi

# Create the node data directories
sudo mkdir -p /opt/public-node/build

cd /opt/public-node/build

if [ -f "/opt/public-node/build/docker-compose.yml" ]; then
    # If we already have a docker-compsoe we will try to remove all containers and delete the outdated versions
    docker compose stop -t 300
    docker compose down
    sudo rm -f docker-compose.yml
    sudo rm -f xai-mainnet.config.json
fi

# Download the current docker compose and xai config
curl -o docker-compose.yml https://storage.googleapis.com/xai-sentry-public-node/node-config/docker-compose.yml
curl -o xai-mainnet.config.json https://storage.googleapis.com/xai-sentry-public-node/node-config/xai-mainnet.config.json

# Change the owner of the directory to the current user and group
sudo chown -R tfadmin:tfadmin /opt/public-node

# EPORT ENV VARS
export ETH_RPC_URL=${eth_rpc_url}
export PROJECT_ID=${gcp_project_id}
export SERVICE_ACCOUNT_EMAIL=${service_account_email}
export SERVICE_ACCOUNT_PRIVATE_KEY=${service_account_api_key}
export BUCKET_NAME=${bucket_name}

sudo -u tfadmin docker compose up -d