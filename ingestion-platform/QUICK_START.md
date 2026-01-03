# 🚀 Quick Start Guide

## Current Status: ✅ READY FOR PILOT

Your ingestion platform is **fully operational** and extracting content from Inshorts!

## What's Running

- ✅ **API Server**: `http://localhost:3000`
- ✅ **Worker**: Processing jobs in background
- ✅ **Database**: Postgres with all tables
- ✅ **Queue**: Redis handling job queue
- ✅ **Storage**: Minio (S3-compatible) ready
- ✅ **Scheduler**: Auto-runs hourly (can disable)

## Test It Right Now

### 1. View Available Sources
```bash
curl http://localhost:3000/api/sources
```
Or open in browser: http://localhost:3000/api/sources

### 2. Trigger an Ingestion Job
```bash
curl -X POST http://localhost:3000/api/jobs/run \
  -H "Content-Type: application/json" \
  -d '{"sourceId": "inshorts", "category": "technology"}'
```

### 3. Get the Feed (after 60-90 seconds)
```bash
curl http://localhost:3000/api/feed?limit=5
```
Or open: http://localhost:3000/api/feed?limit=5

### 4. View Database
```bash
npx prisma studio
```
Opens browser UI to see all content items.

## API Endpoints

### GET `/api/sources`
List all available sources and their categories.

### POST `/api/jobs/run`
Trigger an ingestion job.
```json
{
  "sourceId": "inshorts",
  "category": "technology"  // optional
}
```

### GET `/api/feed`
Get content feed with pagination.
- `?source=inshorts` - Filter by source
- `?category=technology` - Filter by category  
- `?limit=25` - Items per page (max 100)
- `?cursor=...` - Pagination cursor

## Current Pipeline Status

1. **Extraction**: ✅ Working (Playwright)
2. **Storage**: ✅ Working (Postgres)
3. **Rewrite**: ⚠️ Using mock LLM (add API key for real)
4. **Image Resolution**: ⚠️ Needs API keys (optional)

## Cost Breakdown

- **Infrastructure**: $0 (local Docker)
- **Extraction**: $0 (self-hosted Playwright)
- **LLM Rewriting**: $0 (mock) or ~$0.01/item (with OpenAI)
- **Image Search**: $0 (optional, needs API key)

## Next Steps

1. **Test different categories**:
   - Business, Sports, Entertainment, etc.
   - Each takes ~60-90 seconds

2. **Add real LLM** (optional):
   - Add `OPENAI_API_KEY` to `.env`
   - Restart worker

3. **Add image search** (optional):
   - Add image search API key
   - Images will be resolved automatically

4. **Monitor jobs**:
   - Check `ingestion_runs` table in Prisma Studio
   - See stats: extracted, inserted, skipped counts

## Troubleshooting

**Feed is empty?**
- Wait 60-90 seconds after triggering job
- Check worker logs for errors
- Verify Docker containers are running

**Worker not processing?**
- Check: `ps aux | grep worker`
- Restart: `pkill -f worker && npm run worker`

**API not responding?**
- Check: `curl http://localhost:3000/api/sources`
- Restart: `pkill -f "node.*dist/index" && npm run dev`

## Production Notes

For production deployment:
1. Set proper environment variables
2. Use managed Postgres/Redis (not Docker)
3. Use S3/R2 (not Minio)
4. Set up process manager (PM2)
5. Enable monitoring/logging
