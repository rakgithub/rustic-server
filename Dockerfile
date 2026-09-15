FROM node:22-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM build AS production-dependencies

RUN pnpm prune --prod

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY --chown=node:node --from=build /app/package.json ./
COPY --chown=node:node --from=production-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

EXPOSE 3006

USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3006/health/live').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/main.js"]
