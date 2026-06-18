FROM node:20-slim AS deps

WORKDIR /sudocle
COPY package.json package-lock.json ./
RUN npm ci -f

FROM node:20-slim AS build

WORKDIR /sudocle
COPY --from=deps /sudocle/node_modules ./node_modules
COPY package.json package-lock.json next.config.js postcss.config.js tsconfig.json eslint.config.mjs ./
COPY public ./public
COPY src ./src

ARG MATOMO_URL
ARG MATOMO_SITE_ID
ARG SUDOCLE_CORS_ALLOW_ORIGIN
ARG SUDOCLE_BASE_PATH

RUN npm run build

FROM node:20-slim

RUN useradd -s /bin/bash -m sudocle && \
    mkdir -p /sudocle/.next/cache/fetch-cache && \
    chown -R sudocle /sudocle/.next/cache/fetch-cache

COPY --from=build --chown=sudocle:sudocle /sudocle/.next/standalone/ /sudocle
WORKDIR /sudocle

EXPOSE 3000

ENV PRELOAD_PUZZLES=0

USER sudocle
CMD ["node", "server.js"]
