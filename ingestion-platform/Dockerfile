# Multi-stage build for production
# Use Debian-based image for better compatibility with native dependencies
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy Prisma schema (needed for generate)
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Install Playwright browsers (optional, for fallback extraction)
# This is optional but recommended if using Playwright fallback
RUN npx playwright install chromium --with-deps || echo "Playwright install skipped (optional)"

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
