# syntax=docker/dockerfile:1

FROM node:26-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:26-slim
LABEL org.opencontainers.image.source=https://github.com/jumpingmushroom/TaskJar \
      org.opencontainers.image.description="TaskJar: pull a random small task that fits your free minutes"
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=/data/taskjar.db \
    MIGRATIONS_DIR=/app/drizzle
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/drizzle ./drizzle
# Unraid template and icon, so they can be installed straight from the image.
COPY unraid ./unraid
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/taskjar-entrypoint
RUN mkdir -p /data
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/healthz').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
# Starts as root only to fix /data ownership, then drops to PUID:PGID.
ENTRYPOINT ["taskjar-entrypoint"]
CMD ["node", "build"]
