FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create data directory for SQLite during build
RUN mkdir -p data

# Generate Drizzle migrations
RUN npm run db:generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./data/sqlite.db"
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install build dependencies for better-sqlite3
RUN apk add --no-cache libc6-compat python3 make g++

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy drizzle config and schema for migrations
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/lib/db ./lib/db
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy drizzle dependencies directly from deps stage
COPY --from=deps /app/node_modules/drizzle-kit ./node_modules/drizzle-kit
COPY --from=deps /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=deps /app/node_modules/tsx ./node_modules/tsx
COPY --from=deps /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=deps /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=deps /app/node_modules/bindings ./node_modules/bindings
COPY --from=deps /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
COPY --from=deps /app/node_modules/get-tsconfig ./node_modules/get-tsconfig
COPY --from=deps /app/node_modules/resolve-pkg-maps ./node_modules/resolve-pkg-maps

# Copy entrypoint script
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p data && chown nextjs:nodejs data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
