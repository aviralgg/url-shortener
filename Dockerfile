# =============================================================================
# ShortLink Dockerfile
# =============================================================================
# A Dockerfile is a recipe for building a Docker IMAGE.
# An image is a snapshot of your app + everything it needs to run.
#
# Build:  docker build -t shortlink-api .
# Run:    docker run -p 3000:3000 --env-file .env.docker shortlink-api
#
# We use MULTI-STAGE builds: several FROM steps in one file.
# Only the final stage becomes the image you run — keeps it small.
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: base
# Purpose: shared starting point for later stages
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# All following commands run inside /usr/src/app in the image
WORKDIR /usr/src/app

# curl  → used by HEALTHCHECK below
# ca-certificates → HTTPS requests work inside the container
RUN apk add --no-cache ca-certificates curl

# -----------------------------------------------------------------------------
# STAGE 2: deps
# Purpose: install production npm packages only (no Jest, ESLint, etc.)
# -----------------------------------------------------------------------------
FROM base AS deps

# Copy only package files first (Docker caches this layer — faster rebuilds)
COPY package.json package-lock.json* ./

# npm ci = clean install from lock file (reproducible builds)
# --omit=dev = skip devDependencies — smaller node_modules
RUN npm ci --omit=dev

# -----------------------------------------------------------------------------
# STAGE 3: runner (this is the final image)
# Purpose: copy app code + node_modules, run as non-root user
# -----------------------------------------------------------------------------
FROM base AS runner

WORKDIR /usr/src/app

# production mode — Express and other libs may optimize behavior
ENV NODE_ENV=production

# Copy node_modules from the deps stage (not from your host machine)
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json ./

# Application source code and SQL migrations
COPY src ./src
COPY sql ./sql

# Security: don't run as root inside the container
RUN addgroup -S shortlink && adduser -S shortlink -G shortlink
USER shortlink

# Document which port the app listens on (does not publish it by itself)
EXPOSE 3000

# Docker checks /health every 30s; marks container unhealthy if it fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Default command when container starts (overridden for worker in docker-compose)
CMD ["node", "src/server.js"]
