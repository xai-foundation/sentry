# Base stage
FROM node:20.11.0 AS base

# Set environment variables
ENV NEXT_PUBLIC_APP_ENV=development

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy the entire monorepo to the container, excluding node_modules and other ignored files
COPY . .

# Install all dependencies for the monorepo
RUN pnpm install

# Build the web-staking application
WORKDIR /app/apps/web-staking
RUN pnpm build

# Release stage
FROM node:20.11.0 AS release

# Set environment variables
ENV NEXT_PUBLIC_APP_ENV=development

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy only necessary files from the base stage
COPY --from=base /app/apps/web-staking /app/apps/web-staking
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/package.json /app/package.json

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "staking"]
