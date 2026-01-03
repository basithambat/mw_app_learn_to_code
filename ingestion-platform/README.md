# Content Ingestion Platform

**Cost-Effective, Scalable Content Ingestion** using RSS feeds, HTML parsing, and optional Playwright/Firecrawl fallbacks.

## Extraction Strategy (Cheapest First)

1. **RSS Feeds** (Free) - For sources with RSS/Atom feeds
2. **HTML Parsing** (Free) - For sites like Inshorts using Cheerio
3. **Playwright** (Self-hosted, Free) - For JavaScript-heavy pages
4. **Firecrawl** (Optional, Paid) - Only when needed for complex pages

## Stack

- **Runtime**: Node.js + TypeScript
- **API**: Fastify
- **Queue**: BullMQ + Redis
- **Database**: Postgres (Prisma)
- **Extraction**: RSS Parser, Cheerio (HTML), Playwright (self-hosted), Firecrawl (optional)
- **Storage**: S3-compatible (Minio for local)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Firecrawl API Key (optional - only needed if using Firecrawl extraction)

## Setup

1. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```

2. **Environment**:
   Copy `env.example` to `.env`. Firecrawl API key is optional.
   ```bash
   cp env.example .env
   # Edit .env and add FIRECRAWL_API_KEY only if you want to use Firecrawl
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Database Migration**:
   ```bash
   npx prisma migrate dev --name init
   ```

## Running the Platform

1. **Start API Server**:
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:3000`.

2. **Start Worker**:
   ```bash
   npm run worker
   ```

## Usage

### 1. Trigger an Ingestion Job

```bash
curl -X POST http://localhost:3000/api/jobs/run \
  -H "Content-Type: application/json" \
  -d '{"sourceId": "inshorts", "category": "technology"}'
```

### 2. Get Feed

```bash
curl "http://localhost:3000/api/feed?source=inshorts&limit=10"
```

### 3. List Sources

```bash
curl http://localhost:3000/api/sources
```

## Adding a New Source

1. Create a new adapter in `src/adapters/<name>.ts` implementing `SourceAdapter`.
2. Register it in `src/adapters/registry.ts`.
3. Add any necessary categories.

## Deployment

- Set `DATABASE_URL`, `REDIS_URL`, `S3_*`, and `FIRECRAWL_API_KEY` in production environment.
- Run `npm run build` to compile TS.
- Run `npm start` for API.
- Run `node dist/worker.js` for worker (or use a process manager like PM2).
