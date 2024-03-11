# Dockerfile
# ---- Base Node ----
FROM node:lts AS base
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

# --- Release ----
FROM gcr.io/distroless/nodejs20-debian11 AS release
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/index.mjs ./index.mjs
COPY package.json .
CMD ["./node_modules/.bin/zx", "index.mjs"]