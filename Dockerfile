# Dockerfile

FROM node:20.11.0 AS base
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --ignore-scripts --loglevel debug
RUN pnpm -filter @sentry/web-staking run build
EXPOSE 3000
CMD [ "pnpm -filter @sentry/web-staking", "run", "start" ]