# ======================
# STAGE 1: Build (TypeScript -> JavaScript)
# ======================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ======================
# STAGE 2: Dependências de produção
# (separado do build pois bcrypt precisa compilar nativo pra alpine)
# ======================
FROM node:22-alpine AS deps

WORKDIR /app

# Ferramentas necessárias para compilar módulos nativos (bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# ======================
# STAGE 3: Imagem final de produção
# ======================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário: node_modules de produção + build compilado
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Usuário não-root por segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]