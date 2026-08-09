# GetHire Frontend — Dockerfile
# ================================
# Development image for the React + Vite frontend.
#
# Hot-reload strategy:
#   The source code is mounted as a Docker volume in docker-compose.yml.
#   Vite's HMR (Hot Module Replacement) watches for file changes and pushes
#   updates to the browser without a full page reload.
#
# Production builds:
#   For production, use `npm run build` to generate a static bundle and serve
#   it via a Nginx container or Vercel CDN (not configured in Sprint 0).

FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies separately from source to maximise layer caching.
# The node_modules layer is only rebuilt when package.json or package-lock.json changes.
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies — needed for Vite dev server)
RUN npm ci

# Copy source files
# NOTE: In docker-compose.yml the source directory is mounted as a volume,
#       so changes on the host are reflected inside the container immediately.
#       This COPY is here for standalone `docker build` scenarios.
COPY . .

EXPOSE 5173

# Health check — Vite dev server should respond on port 5173
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5173 || exit 1

# Start the Vite dev server
# --host 0.0.0.0 makes it accessible outside the container
CMD ["npm", "run", "dev"]
