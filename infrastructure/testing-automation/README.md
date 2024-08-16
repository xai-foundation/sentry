# xai-automated-testing

# TDD Operator Automated Test

## Project Overview

This project implements automated tests for a blockchain operator using Test-Driven Development (TDD). The tests ensure the correct functionality of key operations such as submitting challenges, downloading the CLI version, starting and stopping the operator, and retrieving logs on the UI.

### Purpose

The automated tests are designed to validate the behavior of blockchain operator under controlled conditions. By following a TDD approach, we aim to maintain reliability and predictability in the operator's functionalities throughout development cycles.

## Prerequisites

### Software Dependencies

- Node.js: Version 18 or higher is required for running JavaScript code and managing project dependencies.
- npm: Version 6 or higher is needed to handle package installations.
- Docker: Docker is used to containerize the application and its dependencies, ensuring consistency across different environments.

## Installation Instructions

1. **Clone the Repository**:

   - Clone the project repository to your local machine to get access to the project files.

   ```bash
   git clone https://gitlab.cryptit.at/cryptit-dev/xai-automated-testing
   cd xai-automated-testing
   ```

2. **Install Dependencies**:

   - Install all the required Node.js packages listed in package.json.

   ```bash
   npm install
   ```

3. **Environment Setup**:
   - Create a `.env` file in the project root with necessary environment variables. These variables include the version of the operator CLI, the path to the log file, and the private key for the operator wallet. 

   - `VERSION`: The version of the operator CLI to be used.
   - `LOG_FILE_PATH`: Path to the log file for capturing output.
   - `PRIVATE_KEY`: Private key for the operator wallet.
   
   Example:
   ```env
   VERSION=1.1.14-rebrand-113
   LOG_FILE_PATH=/path/to/log/file.log
   PRIVATE_KEY=32Aasdasd1212ascswac...
   ```

## Usage

### Running Tests

1. **Configuration Docker**:

`Docker containers provide isolated environments for running your applications. You'll build and run two Docker images: one for the Next.js UI and another for the operator.`

`For Linux`:

```
- NextUi Image:

This Dockerfile sets up the base Node.js environment, installs dependencies, builds the Next.js application, and prepares it for production. It also installs Docker CLI for running Docker commands within the container.

# Dockerfile
# ---- Base Node ----
FROM node:20.11.0 AS base
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

# ---- Build ----
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY . .
RUN npm run build

# Install Docker CLI
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    apt-transport-https \
    ca-certificates \
    gnupg \
    && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - \
    && echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# --- Release ----
FROM node:20.11.0 AS release
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY --from=build /app/.next ./.next
#COPY --from=build /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000
CMD ["./node_modules/next/dist/bin/next", "start"]
```

```
- Operator Image:

This Dockerfile sets up the operator environment, installing necessary tools like curl and screen. It prepares the container to run the operator and log output to a file.

# Update package lists and install curl and unzip
FROM ubuntu:latest
RUN apt-get update && apt-get -y install sudo && apt-get install -y \
    curl \
    unzip \
    screen \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

CMD tail -f /dev/null
```

```
Build and Run Containers:

Build and run the Docker containers using the following commands. This will create and start the containers, mapping necessary volumes and ports.

- docker build -t tdd-local-image --no-cache .
- docker run -d --name tdd-local --restart always -p 3000:3000
  -v ./versions:/app/versions  
  -v ./logs:/app/logs  
  -v /var/run/docker.sock:/var/run/docker.sock   
  -v /usr/bin/docker:/usr/bin/docker tdd-local-image
- docker build -t tdd-operator-image --no-cache -f Dockerfile .
- docker run -d --name tdd-operator --restart always -v ./versions:/app/versions -v ./logs:/app/logs tdd-operator-image
```

`For Windows`:

```
- NextUi Image:

This Dockerfile prepares the Node.js environment, installs dependencies, builds the Next.js application, and sets it up for production. It also includes Docker CLI for managing Docker within the container.

# ---- Base Node ----
FROM node:20.11.0 AS base
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

# ---- Build ----
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY . .
RUN npm run build

# --- Release ----
FROM node:20.11.0 AS release
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY --from=build /app/.next ./.next
#COPY --from=build /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY package.json .

# Installing Docker CLI
RUN apt-get update && apt-get install -y docker.io

EXPOSE 3000
CMD ["./node_modules/next/dist/bin/next", "start"]
```

```
- Operator Image:

This Dockerfile sets up the operator environment on Ubuntu, installing necessary tools like curl and screen, and redirects output to a log file.

FROM ubuntu:latest

RUN apt-get update \
    && apt-get -y install sudo \
    && apt-get install -y \
        curl \
        unzip \
        screen \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Example: Redirect output to a log file
CMD ["sh", "-c", "tail -f /dev/null > /app/logs.txt"]
```

```
Docker Compose:

Docker Compose file for managing multiple containers. It simplifies running both the tdd-local and tdd-operator containers.

version: '3.8'

services:
  tdd-local:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tdd-local
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - C:/versions:/app/versions
      - C:/logs:/app/logs
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - NEXT_TELEMETRY_DISABLED=1

  tdd-operator:
    build:
      context: /docker-operator/
      dockerfile: Dockerfile
      args:
        - no-cache=true
    image: tdd-operator-image
    container_name: tdd-operator
    restart: always
    volumes:
      - C:/versions:/app/versions
      - C:/logs:/app/logs
```

2. **Run Tests**

**_Ensure Docker Containers are Running:_**
Before running your tests, you need to verify that the Docker containers for both the Next.js UI and the operator are up and running. This ensures that all necessary services are available and functioning properly.

- `Check Running Containers:`

Use the following command to list all running Docker containers:

```
docker ps
```

This command will display a list of currently running containers along with their names, IDs, statuses, and other details. Ensure that you see containers named tdd-local and tdd-operator in the list. If the containers are not listed, it means they are not running, and you may need to start them manually using the commands provided in the Docker configuration section.

- `Verify Docker Socket Functionality:`

To ensure that the Docker socket is functioning correctly within your containers, you can run a simple Docker command inside one of the containers. This verifies that Docker commands can be executed properly.

```
docker exec -it tdd-local bash
docker ps
```

If these commands execute without errors, the Docker socket is working correctly. If you encounter any errors, check your Docker configuration and ensure that the Docker socket is properly mounted.

**_Access the NextUI Page:_**
Once the Docker containers are confirmed to be running, you can access the NextUI page where all available tests are listed. This UI provides an interface to interact with and run the tests.

- `Open Your Web Browser:`

  Navigate to the following URL in your web browser:

  ```
  http://localhost:3000
  ```
  This will open the NextUI page, where you can see all the tests available for the blockchain operator. From here, you can run individual tests, view test results, and monitor the overall functionality of the operator

By following these steps, you ensure that your Docker containers are running correctly and that you can access the test UI to perform automated testing of the blockchain operator.

3. **Operator Control and Log Management**

In addition to the automated tests, the project also includes a convenient control mechanism for managing the blockchain operator inside the ttd-operator container. This includes:

- `CLI Version Download:`
  The UI also provides the ability to copy a link and download the CLI version of the operator. This functionality makes it easy to access and use the latest version of the CLI, ensuring that you always have the necessary tools at your disposal.

- `Start and Stop Operator:`
  The UI provides buttons to start and stop the operator using the screen utility within the container. This allows for easy management of the operator's lifecycle without needing to access the container's command line directly.

- `Log Retrieval:`
  After stopping the operator, you can retrieve logs from the last session. This ensures that you have access to the most recent operational data, which is crucial for debugging and verifying the behavior of the operator.

- `Log Download:`
  You can download all logs in a zip archive directly from the UI. This feature simplifies the process of log management and enables easy sharing and archiving of logs for future reference or detailed analysis.

By integrating these functionalities into the UI, the project enhances the overall user experience, making it straightforward to control the operator and manage logs effectively.
