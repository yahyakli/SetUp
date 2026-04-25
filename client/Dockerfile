FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build time
ARG NEXT_PUBLIC_USER_SERVICE_URL
ARG NEXT_PUBLIC_PROJECT_SERVICE_URL
ARG NEXT_PUBLIC_TASK_SERVICE_URL
ARG NEXT_PUBLIC_CHAT_SERVICE_URL
ARG NEXT_PUBLIC_NOTIFICATION_SERVICE_URL
ARG NEXT_PUBLIC_BILLING_SERVICE_URL

ENV NEXT_PUBLIC_USER_SERVICE_URL=$NEXT_PUBLIC_USER_SERVICE_URL
ENV NEXT_PUBLIC_PROJECT_SERVICE_URL=$NEXT_PUBLIC_PROJECT_SERVICE_URL
ENV NEXT_PUBLIC_TASK_SERVICE_URL=$NEXT_PUBLIC_TASK_SERVICE_URL
ENV NEXT_PUBLIC_CHAT_SERVICE_URL=$NEXT_PUBLIC_CHAT_SERVICE_URL
ENV NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=$NEXT_PUBLIC_NOTIFICATION_SERVICE_URL
ENV NEXT_PUBLIC_BILLING_SERVICE_URL=$NEXT_PUBLIC_BILLING_SERVICE_URL

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/out/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/out/static ./out/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
