# Stage 1: Build Stage
FROM node:20.11.0 AS build

# Install pnpm globally
RUN npm i -g pnpm@9.7.0 nx@18.3.3

# Set the working directory inside the container
WORKDIR /app

# Copy the entire monorepo to the container, excluding node_modules and other ignored files
COPY . .

# Install all dependencies for the monorepo
RUN pnpm install

# Build the web-staking application
RUN npx nx build @sentry/web-connect


# Stage 2: Release Stage (Production)
FROM node:20.11.0-alpine AS release

# Install the 'serve' package globally to serve static files
RUN npm install -g serve

# Set the working directory inside the release container
WORKDIR /app

# Copy only the build artifacts from the 'build' stage
COPY --from=build /app/apps/web-connect/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start the app using "serve" on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]