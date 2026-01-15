FROM node:20-alpine AS base

WORKDIR /app

COPY package.json yarn.lock ./

FROM base AS dependencies

RUN apk add --no-cache python3 make g++ openssl

RUN yarn install --frozen-lockfile --production=false

FROM dependencies AS build

COPY . .

COPY .env.build .env

RUN yarn prisma generate

RUN yarn tsc

FROM base AS production-deps

RUN apk add --no-cache openssl

# Copy prisma schema before install
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Install dependencies without running postinstall (which needs DATABASE_URL)
RUN yarn install --frozen-lockfile --production=true --ignore-scripts && \
    yarn cache clean

# Generate Prisma client with a dummy DATABASE_URL (only needed for generation)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN yarn prisma generate

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nodejs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --chown=nodejs:nodejs package.json yarn.lock ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["sh", "-c", "yarn prisma migrate deploy && yarn prod"]