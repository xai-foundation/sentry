# Dockerfile
# ---- Base Node ----
FROM node:20.11.0 AS base

# TODO => Remove this line for production deployment
ENV NEXT_PUBLIC_APP_ENV=development

# Install PNPM
RUN npm install -g pnpm

# Install dependencies with PNPM
RUN pnpm install --loglevel verbose --filter ./apps/web-staking

# ---- Build ----
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY . .
RUN pnpm run build --prefix ./apps/web-staking

# --- Release ----
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY --from=base /app/apps/web-staking/.next ./.next
COPY --from=base /app/apps/web-staking/public ./public
COPY --from=base /app/apps/web-staking/node_modules ./node_modules
COPY apps/web-staking/package.json .
EXPOSE 3000
CMD ["./node_modules/next/dist/bin/next", "start"]
