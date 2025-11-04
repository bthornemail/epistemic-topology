# DANL MCP Server - Production Dockerfile
# Multi-stage build for optimal image size

# Stage 1: Build
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Stage 2: Runtime with Scheme
FROM node:18-alpine

# Install Guile Scheme interpreter
RUN apk add --no-cache \
    guile \
    guile-dev \
    bash

# Create app user
RUN addgroup -g 1001 -S danl && \
    adduser -S danl -u 1001

# Set working directory
WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy DANL Scheme implementation
COPY ../../decentralized_automaton_network/scheme/danl.scm /app/scheme/danl.scm

# Create persistence directory
RUN mkdir -p /app/persistence/danl && \
    chown -R danl:danl /app

# Switch to non-root user
USER danl

# Expose port (default 3000)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Environment variables
ENV NODE_ENV=production \
    DANL_PORT=3000 \
    DANL_HOST=0.0.0.0 \
    SCHEME_INTERPRETER=guile \
    DANL_SCHEME_PATH=/app/scheme/danl.scm \
    DANL_PERSISTENCE_PATH=/app/persistence/danl

# Start server
CMD ["node", "dist/index.js"]
