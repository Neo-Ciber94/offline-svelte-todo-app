FROM oven/bun:1.1.17 as base

WORKDIR /base
COPY . ./
RUN bun install --frozen-lockfile

FROM base as builder
RUN bun run build
RUN cd app && bun run db:migrate

FROM node:20-alpine3.19 as runner
WORKDIR /app
COPY --from=builder /base/app/node_modules ./node_modules
COPY --from=builder /base/app/build ./
COPY --from=builder /base/app/data ./data
RUN echo '{"name": "app", "type":"module"}' >> package.json

ENV PORT=5000
CMD ["node", "/app/index.js"]
