# Dockerfile
# ---- Base Node ----
FROM node:20.11.0

# TODO => Remove this line for production deployment
ENV NEXT_PUBLIC_APP_ENV=development

# Install PNPM
RUN npm install -g pnpm

# ---- Build ----
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY . .

# Install dependencies with PNPM
RUN pnpm install
RUN rm .eslintrc.js
RUN pnpm -filter @sentry/web-staking run build

EXPOSE 3000
CMD ["./node_modules/next/dist/bin/next", "start"]
