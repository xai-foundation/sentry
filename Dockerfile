# ---- Base Node ----
    FROM node:20.11.0 AS base

    # TODO => Remove this line for production deployment
    ENV NEXT_PUBLIC_APP_ENV=development
    
    # Install PNPM
    RUN npm install -g pnpm
    
    # ---- Build ----
    FROM base AS build
    ENV NEXT_TELEMETRY_DISABLED 1
    WORKDIR /app
    COPY . .
    
    # Install dependencies with PNPM
    RUN pnpm install
    
    # Remove ESLint config file if needed
    RUN rm .eslintrc.js
    
    # Build the project
    RUN pnpm -filter @sentry/web-staking run build
    
    # ---- Release ----
    FROM node:20.11.0 AS release
    WORKDIR /app
    
    # Copy built project from build stage
    COPY --from=build /app /app
    
    # Expose the desired port
    EXPOSE 8080
    
    # Command to run the application
    CMD ["./node_modules/next/dist/bin/next", "start"]
    