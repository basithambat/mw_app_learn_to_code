# 🔧 Quick Fix: API Deployment Issue

## Current Problem

API deployment to Cloud Run failed during build.

## Quick Diagnostic Steps

### 1. Check Build Logs

```bash
# Get latest build
BUILD_ID=$(gcloud builds list --limit 1 --project gen-lang-client-0803362165 --format="value(id)")

# View error
gcloud builds log $BUILD_ID --project gen-lang-client-0803362165 | grep -i error | tail -20
```

### 2. Common Fixes

#### Fix A: Prisma Client Not Generated
```bash
cd ingestion-platform
npx prisma generate
npm run build
```

#### Fix B: Missing Dependencies
```bash
cd ingestion-platform
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Fix C: TypeScript Errors
```bash
cd ingestion-platform
npm run typecheck
# Fix any TypeScript errors shown
```

### 3. Test Docker Build Locally

```bash
cd ingestion-platform
docker build -t test-build .
```

If this fails, the error will show what's wrong.

### 4. Alternative: Deploy Pre-built Image

If local build works:

```bash
# Tag and push
docker tag test-build gcr.io/gen-lang-client-0803362165/whatsay-api
docker push gcr.io/gen-lang-client-0803362165/whatsay-api

# Deploy
gcloud run deploy whatsay-api \
  --image gcr.io/gen-lang-client-0803362165/whatsay-api \
  --region asia-south1 \
  --platform managed \
  --project gen-lang-client-0803362165 \
  --add-cloudsql-instances gen-lang-client-0803362165:asia-south1:whatsay-db \
  --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --memory 512Mi \
  --cpu 1 \
  --allow-unauthenticated
```

---

## Most Likely Issues

1. **Prisma client not generated in Dockerfile** - Check Dockerfile line 18
2. **TypeScript compilation error** - Check `npm run build` output
3. **Missing .gcloudignore causing large upload** - Already fixed ✅
4. **Node version mismatch** - Dockerfile uses node:18-slim ✅

---

**Run the diagnostic steps above to identify the exact issue!** 🔍
