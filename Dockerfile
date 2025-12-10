# Build stage
FROM node:20.11-alpine3.19 AS builder

# Instala dependências necessárias para build
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

# Copia arquivos de dependências
COPY package.json yarn.lock ./

# Instala dependências
RUN yarn install --frozen-lockfile --production=false

# Copia código fonte
COPY . .

# Build da aplicação (usa DATABASE_URL dummy apenas para build)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" yarn build

# Production stage
FROM node:20.11-alpine3.19

# Instala apenas openssl (necessário para Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# Cria usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copia dependências de produção
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true && \
    yarn cache clean

# Copia build da stage anterior
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Muda para usuário não-root
USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["sh", "-c", "yarn prisma migrate deploy && yarn prod"]