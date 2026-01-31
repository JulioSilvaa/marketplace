FROM node:20-alpine AS base
WORKDIR /app
# libc6-compat é essencial para o Prisma rodar no Alpine
RUN apk add --no-cache openssl libc6-compat
COPY package.json yarn.lock ./

# ---------- ESTÁGIO 1: DEPENDÊNCIAS DE DESENVOLVIMENTO ----------
FROM base AS dependencies
RUN apk add --no-cache python3 make g++
RUN yarn install --frozen-lockfile --production=false

# ---------- ESTÁGIO 2: BUILD (Compilação e Prisma) ----------
FROM dependencies AS build
COPY . .
COPY .env.build .env
# Gera o Prisma Client baseado no seu schema.prisma
RUN npx prisma generate
# Compila o TypeScript para JavaScript
RUN yarn tsc

# ---------- ESTÁGIO 3: DEPENDÊNCIAS DE PRODUÇÃO ----------
FROM base AS production-deps
RUN yarn install --frozen-lockfile --production=true && \
    yarn cache clean

# ---------- ESTÁGIO 4: RUNNER (A imagem que vai para o servidor) ----------
FROM node:20-alpine AS runner
# Repetimos a lib aqui pois o Runner é uma imagem nova e limpa
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Segurança: Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiamos apenas o estritamente necessário (deixa a imagem leve)
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nodejs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --chown=nodejs:nodejs package.json yarn.lock ./

ENV NODE_ENV=production

# Define o usuário criado para rodar o processo
USER nodejs

EXPOSE 3000

# IMPORTANTE: Removido o prisma migrate deploy daqui. 
# O deploy.sh agora cuida disso via container 'migrate-prod'.
CMD ["node", "dist/src/infra/http/express/Express.js"]