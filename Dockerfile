# Dockerfile

FROM node:20.11.0 AS base
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --loglevel debug
EXPOSE 3000
CMD [ "pnpm", "run", "web-staking" ]