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