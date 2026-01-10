# 🔧 Alternative Deployment Methods

## Current Issue

The standard `gcloud run deploy --source` is failing during Docker build. Here are alternative methods to deploy.

---

## Method 1: Cloud Build with cloudbuild.yaml ✅ (Running Now)

**Status:** Currently deploying using this method

**What it does:**
- Uses Cloud Build API directly
- More control over build process
- Better error visibility
- Separate build and deploy steps

**Monitor:**
```bash
# Check build status
gcloud builds list --limit 1 --project gen-lang-client-0803362165

# Or check console
# https://console.cloud.google.com/cloud-build/builds?project=gen-lang-client-0803362165
```

---

## Method 2: Simplified Deployment (If Method 1 Fails)

**Script:** `deploy-simple.js`

**Approach:**
1. Deploy without Cloud SQL connection first
2. Add Cloud SQL connection after
3. Send traffic to new revision

**Run:**
```bash
node deploy-simple.js
```

**Why it might work:**
- Separates concerns
- Easier to debug which step fails
- Can test service before adding database

---

## Method 3: Manual Docker Build & Push

**If you have Docker Desktop running:**

```bash
cd ingestion-platform

# Build image
docker build -t gcr.io/gen-lang-client-0803362165/whatsay-api .

# Push to Container Registry
docker push gcr.io/gen-lang-client-0803362165/whatsay-api

# Deploy from image
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

## Method 4: Fix Dockerfile Issues

**Potential fixes applied:**

1. ✅ **Prisma Generation** - Ensured Prisma CLI is available
2. ✅ **TypeScript Error** - Fixed logging issue
3. ⚠️ **Build Context** - Check .gcloudignore isn't excluding needed files

**Test Dockerfile locally:**
```bash
cd ingestion-platform
docker build -t test-build . 2>&1 | tee build.log
```

---

## Method 5: Use Artifact Registry (More Modern)

**If Container Registry has issues:**

```bash
# Create Artifact Registry repository
gcloud artifacts repositories create whatsay-repo \
  --repository-format=docker \
  --location=asia-south1 \
  --project=gen-lang-client-0803362165

# Build and push
gcloud builds submit --tag asia-south1-docker.pkg.dev/gen-lang-client-0803362165/whatsay-repo/whatsay-api:latest \
  --project gen-lang-client-0803362165

# Deploy
gcloud run deploy whatsay-api \
  --image asia-south1-docker.pkg.dev/gen-lang-client-0803362165/whatsay-repo/whatsay-api:latest \
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

## Method 6: Check Build Logs via API

**Get detailed error:**

```bash
# Get latest build ID
BUILD_ID=$(gcloud builds list --limit 1 --project gen-lang-client-0803362165 --format="value(id)")

# Get full logs
gcloud builds log $BUILD_ID --project gen-lang-client-0803362165 > build.log

# Search for errors
grep -i "error\|fail" build.log | tail -50
```

---

## Current Status

**Method 1 (Cloud Build) is running in background**

Check status:
```bash
gcloud builds list --limit 1 --project gen-lang-client-0803362165 --format="table(id,status,createTime)"
```

---

## Recommended Order

1. ✅ **Method 1** - Cloud Build (currently running)
2. **Method 2** - Simplified deployment (if Method 1 fails)
3. **Method 3** - Manual Docker (if you have Docker)
4. **Method 5** - Artifact Registry (if Container Registry issues)
5. **Method 6** - Debug with logs (to find root cause)

---

**Method 1 is running - check back in 15-20 minutes!** ⏳
