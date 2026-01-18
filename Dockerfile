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

RUN yarn install --frozen-lockfile --production=true && \
    yarn cache clean

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

ENV NODE_ENV=production

USER nodejs

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/infra/http/express/Express.js"]