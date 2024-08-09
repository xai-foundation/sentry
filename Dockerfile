# Base stage
FROM node:20.11.0 AS release

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1

# Install pnpm globally
RUN npm i -g pnpm@9.7.0 nx@18.3.3

# Set the working directory inside the container
WORKDIR /app

# Copy the entire monorepo to the container, excluding node_modules and other ignored files
COPY . .

# Install all dependencies for the monorepo
RUN pnpm install

# Build the web-staking application
RUN npx nx build @sentry/web-staking

# Dev expose default port 3000 - should be handled by deployment
EXPOSE 3000

# Dev CMD to run the staking app - handled by deployment
CMD ["npx", "nx", "start", "@sentry/web-staking"]