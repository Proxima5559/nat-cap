FROM oven/bun:1.1 AS base
WORKDIR /app

FROM base AS install
RUN mkdir -p /tmp/dev && mkdir -p /tmp/prod
COPY package.json bun.lockb /tmp/dev/
RUN cd /tmp/dev && bun install --frozen-lockfile

COPY package.json bun.lockb /tmp/prod/
RUN cd /tmp/prod && bun install --frozen-lockfile --production

FROM base AS development
COPY --from=install /tmp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["bun", "run", "--watch", "src/main.ts"]

FROM base AS release
COPY --from=install /tmp/prod/node_modules node_modules
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
USER bun
ENTRYPOINT [ "bun", "run", "src/main.ts" ]
