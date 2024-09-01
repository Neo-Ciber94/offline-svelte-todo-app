FROM node:20.16.0-slim as base

# Install all dependencies
WORKDIR /base
COPY . ./
RUN npm install -g bun@1.1.26
RUN bun install --frozen-lockfile

# Build the app
FROM base as builder
WORKDIR /base
RUN cd app \
    && mkdir data \
    && npm rebuild sqlite3 \
    && npm run db:migrate
RUN bun run build


# Keep only production dependencies
FROM builder as release
WORKDIR /base
RUN rm -rf node_modules
RUN rm -rf app/node_modules
RUN bun install --production --ignore-scripts && \
    npm rebuild sqlite3

# Copy all and run
## We are using 'slim' here, alpine is silently crashing with a 'segmentation fault'
FROM node:20.16.0-slim as runner 
WORKDIR /app
COPY --from=release /base/node_modules ./node_modules
COPY --from=release /base/app/data ./data
COPY --from=release /base/app/build ./build
COPY --from=release /base/app/package.json ./package.json

ENV PORT=5000
CMD ["node", "/app/build/index.js"]