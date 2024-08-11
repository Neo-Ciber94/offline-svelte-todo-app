FROM oven/bun:1.1.17 as base

# Install all dependencies
WORKDIR /base
COPY . ./
RUN bun install --frozen-lockfile

# Build the app
FROM base as builder
RUN bun run build
RUN cd app && bun run db:migrate

# Copy all and run
FROM node:20-alpine3.19 as runner
WORKDIR /app
COPY --from=builder node_modules ./
COPY --from=builder app/package.json ./
COPY --from=builder app/build ./app/build
COPY --from=builder app/data ./app/data

ENV PORT=5000
CMD ["node", "/app/build/index.js"]