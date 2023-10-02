FROM --platform=linux/amd64 node:20-slim AS base
# Ensure that OpenSSL is installed
RUN apt-get update -y && apt-get install -y openssl
# Install pnpm using npm
RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
COPY .env.production .env
RUN npx prisma generate
RUN pnpm run build

FROM base AS deploy
WORKDIR /app
COPY --from=build /app/.env.production .env
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 3000

CMD npx prisma migrate deploy && pnpm run start:prod
