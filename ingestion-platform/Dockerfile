# Multi-stage build for production
# Use Node 20 for better compatibility with modern packages
FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy Prisma schema (needed for generate)
COPY prisma ./prisma

# Install all dependencies (including dev dependencies for Prisma)
# Use npm install for better compatibility with lock file
RUN npm install

# Generate Prisma client with correct OpenSSL for Node 20
# Set binary target for Debian (Node 20 slim uses Debian)
RUN npx prisma generate --generator client

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm install --only=production --legacy-peer-deps

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
ENV PORT=8080
CMD ["node", "dist/index.js"]
