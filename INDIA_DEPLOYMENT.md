# 🇮🇳 India-First Deployment Guide

## Region Selection: `asia-south1` (Mumbai, India)

**Why Mumbai?**
- ✅ Lowest latency for India users (~10-50ms vs ~200ms from US)
- ✅ Better pricing than Delhi (asia-south2)
- ✅ Full GCP service availability
- ✅ Data residency in India (compliance benefits)

**Latency Comparison:**
- Mumbai (asia-south1): ~10-50ms for India users
- Delhi (asia-south2): ~10-50ms for North India, ~50-100ms for South
- US (us-central1): ~200-300ms for India users

**Pricing (Mumbai):**
- Cloud SQL: Same as US regions
- Redis: ~$35.77/month (1GB minimum)
- Cloud Run: Same pricing
- Storage: $0.12/GB/month

---

## Migration Plan

### Current State
- ❌ Cloud SQL: `us-central1` (needs recreation)
- ❌ Redis: `us-central1` (needs recreation)
- ❌ Storage: `us-central1` (needs recreation)
- ✅ Secrets: Region-agnostic (no change needed)
- ✅ Service Accounts: Region-agnostic (no change needed)

### Target State
- ✅ Cloud SQL: `asia-south1` (Mumbai)
- ✅ Redis: `asia-south1` (Mumbai)
- ✅ Storage: `asia-south1` (Mumbai)
- ✅ Cloud Run: `asia-south1` (Mumbai)
- ✅ Cloud Run Jobs: `asia-south1` (Mumbai)

---

## Step 1: Recreate Infrastructure in Mumbai

**Option A: Automated Script (Recommended)**
```bash
cd /Users/basith/Documents/whatsay-app-main
./setup-gcp-india.sh
```

**Option B: Manual Commands**

### 1. Delete Old Resources (if needed)
```bash
# ⚠️ Only if you want to clean up us-central1 resources
# Otherwise, keep them and just create new ones in Mumbai

# Delete old Redis (if recreating)
gcloud redis instances delete whatsay-redis \
  --region us-central1 \
  --project gen-lang-client-0803362165

# Delete old Cloud SQL (if recreating)
# ⚠️ WARNING: This deletes all data!
gcloud sql instances delete whatsay-db \
  --project gen-lang-client-0803362165
```

### 2. Create Resources in Mumbai
```bash
PROJECT_ID="gen-lang-client-0803362165"
REGION="asia-south1"  # Mumbai

# Create Cloud SQL
gcloud sql instances create whatsay-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password=GENERATE_SECURE_PASSWORD \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --project=$PROJECT_ID

# Create database and user
gcloud sql databases create ingestion_db \
  --instance=whatsay-db \
  --project=$PROJECT_ID

gcloud sql users create app_user \
  --instance=whatsay-db \
  --password=GENERATE_SECURE_PASSWORD \
  --project=$PROJECT_ID

# Create Redis
gcloud redis instances create whatsay-redis \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_7_0 \
  --tier=basic \
  --network=default \
  --project=$PROJECT_ID

# Create Storage Bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://whatsay-content
```

### 3. Update Secrets
```bash
# Get connection details
CONNECTION_NAME=$(gcloud sql instances describe whatsay-db \
  --project=$PROJECT_ID \
  --format="value(connectionName)")

REDIS_HOST=$(gcloud redis instances describe whatsay-redis \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(host)")

REDIS_PORT=$(gcloud redis instances describe whatsay-redis \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(port)")

# Update database-url secret (Unix socket)
DATABASE_URL="postgresql://app_user:PASSWORD@localhost/ingestion_db?host=/cloudsql/$CONNECTION_NAME"
echo -n "$DATABASE_URL" | gcloud secrets versions add database-url --data-file=-

# Update redis-url secret
REDIS_URL="redis://$REDIS_HOST:$REDIS_PORT"
echo -n "$REDIS_URL" | gcloud secrets versions add redis-url --data-file=-
```

---

## Step 2: Deploy API to Mumbai

```bash
cd ingestion-platform

gcloud run deploy whatsay-api \
  --source . \
  --region asia-south1 \
  --platform managed \
  --add-cloudsql-instances gen-lang-client-0803362165:asia-south1:whatsay-db \
  --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest,S3_ENDPOINT=s3-endpoint:latest,S3_BUCKET=s3-bucket:latest,S3_ACCESS_KEY=s3-access-key:latest,S3_SECRET_KEY=s3-secret-key:latest \
  --set-env-vars NODE_ENV=production,PORT=8080,ENABLE_SCHEDULER=false \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300 \
  --allow-unauthenticated \
  --project gen-lang-client-0803362165
```

---

## Step 3: Deploy Worker to Mumbai

```bash
gcloud run jobs create whatsay-worker \
  --image gcr.io/gen-lang-client-0803362165/whatsay-api \
  --region asia-south1 \
  --add-cloudsql-instances gen-lang-client-0803362165:asia-south1:whatsay-db \
  --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest,S3_ENDPOINT=s3-endpoint:latest,S3_BUCKET=s3-bucket:latest,S3_ACCESS_KEY=s3-access-key:latest,S3_SECRET_KEY=s3-secret-key:latest \
  --set-env-vars NODE_ENV=production \
  --memory 1Gi \
  --cpu 1 \
  --max-retries 3 \
  --task-timeout 3600 \
  --command node \
  --args dist/worker.js \
  --project gen-lang-client-0803362165
```

---

## Step 4: Set Up Scheduler in Mumbai

```bash
# Get job execution URL
JOB_URL=$(gcloud run jobs describe whatsay-worker \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(status.url)")

# Create hourly schedule
gcloud scheduler jobs create http whatsay-worker-hourly \
  --schedule="0 * * * *" \
  --uri="$JOB_URL/run" \
  --http-method=POST \
  --oauth-service-account=278662370606-compute@developer.gserviceaccount.com \
  --location=asia-south1 \
  --project gen-lang-client-0803362165
```

---

## Performance Benefits for India Users

**Before (US region):**
- API latency: ~200-300ms
- Database queries: ~200-300ms
- Total response time: ~400-600ms

**After (Mumbai region):**
- API latency: ~10-50ms
- Database queries: ~10-50ms
- Total response time: ~20-100ms

**Improvement: 4-6x faster for India users!** 🚀

---

## Cost Impact

**No additional cost** - same pricing as US regions:
- Cloud SQL: $0-7/month (free tier)
- Redis: ~$35.77/month
- Cloud Run: $0-20/month (free tier)
- Storage: ~$0.20/month
- **Total: ~$36-63/month** (same as before)

---

## Next Steps

1. ✅ Run `./setup-gcp-india.sh` to recreate infrastructure
2. ⏳ Deploy API to Mumbai
3. ⏳ Deploy worker to Mumbai
4. ⏳ Set up scheduler in Mumbai
5. ⏳ Test API endpoints from India
6. ⏳ Monitor latency improvements

---

**Region:** `asia-south1` (Mumbai, India) 🇮🇳  
**Optimized for:** India-first deployment  
**Latency:** ~10-50ms for India users (vs ~200-300ms from US)
