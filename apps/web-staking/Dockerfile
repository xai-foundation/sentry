# Dockerfile
# ---- Base Node ----
FROM node:lts AS base
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY package.json .
RUN npm install

# ---- Build ----
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY . .
RUN npm run build

# --- Release ----
FROM gcr.io/distroless/nodejs20-debian11 AS release
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY package.json .

CMD ["./node_modules/next/dist/bin/next", "start"]