# Dockerfile

ARG NEXT_PUBLIC_APP_ENV=production

# ---- Base Node ----
FROM node:20.11.0 AS base
ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY apps/web-staking/package.json ./apps/web-staking/
COPY apps/web-staking/package-lock.json ./apps/web-staking/
RUN npm install --loglevel verbose -dd --prefix ./apps/web-staking

# ---- Build ----
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
WORKDIR /app
COPY . .
RUN npm run build --prefix ./apps/web-staking

# --- Release ----
FROM gcr.io/distroless/nodejs20-debian11 AS release
ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
WORKDIR /app
COPY --from=build /app/apps/web-staking/.next ./.next
COPY --from=build /app/apps/web-staking/public ./public
COPY --from=base /app/apps/web-staking/node_modules ./node_modules
COPY apps/web-staking/package.json .
COPY apps/web-staking/package-lock.json .
EXPOSE 3000
CMD ["./node_modules/next/dist/bin/next", "start"]
