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

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    apt-transport-https \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# --- Release ----
FROM node:20.11.0 AS release
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY --from=build /app/.next ./.next
# COPY --from=build /app/public ./public
COPY --from=build /app/interval_status ./interval_status
COPY --from=base /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000
CMD ["./node_modules/next/dist/bin/next", "start"]