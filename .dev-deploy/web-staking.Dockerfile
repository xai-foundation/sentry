ARG NEXT_PUBLIC_APP_ENV=development

FROM node:20-alpine AS base

FROM base AS builder
ARG NEXT_PUBLIC_APP_ENV
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY . .

RUN corepack enable pnpm

RUN pnpm i --filter=@sentry/web-staking --filter=@sentry/ui --config.dedupe-peer-dependents=false

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_ENV=development

RUN pnpm --filter=@sentry/web-staking run build


# Production image, copy all the files and run next
FROM base AS runner
ARG NEXT_PUBLIC_APP_ENV
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_ENV=development

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web-staking/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-staking/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-staking/.next/static ./apps/web-staking/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

WORKDIR /app/apps/web-staking

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]