# 🚀 Deployment Status - WhatSay Infrastructure

## Decision Summary

**✅ Deploy First (No VPC Connector Required)**

**Rationale:**
- Cloud SQL has public IP enabled with authorized networks
- Using Cloud SQL Unix socket connector (secure, no VPC needed)
- Redis accessible via public IP with authentication
- All dependencies are public (Firebase, external APIs)
- VPC connector can be added later for hardening

**Architecture:**
- Cloud Run API (min-instances=0, cost-optimized)
- Cloud Run Jobs (worker processes)
- Cloud SQL via Unix socket connector
- Redis via public IP (authenticated)
- Cloud Storage (S3-compatible)

---

## ✅ Completed Setup

### 1. Infrastructure Resources
- ✅ Cloud SQL (PostgreSQL) - `whatsay-db` - RUNNABLE
- ✅ Redis (Memorystore) - `whatsay-redis` - READY (1GB minimum)
- ✅ Cloud Storage - `whatsay-content` - Created
- ✅ Secret Manager - All credentials stored

### 2. Secrets Configured
- ✅ `database-url` - Unix socket connection string
- ✅ `redis-url` - Redis connection
- ✅ `s3-endpoint` - Cloud Storage endpoint
- ✅ `s3-bucket` - Bucket name
- ✅ `s3-access-key` - Service account email
- ✅ `s3-secret-key` - Service account private key

### 3. Service Accounts
- ✅ `whatsay-storage-sa` - Storage access
- ✅ Cloud Run default SA - Has access to all secrets

### 4. APIs Enabled
- ✅ Cloud SQL Admin API
- ✅ Memorystore for Redis API
- ✅ Cloud Run API
- ✅ Secret Manager API
- ✅ Cloud Storage API
- ✅ Artifact Registry API
- ✅ SQL Component API

---

## 🔄 In Progress

### API Deployment
- **Service:** `whatsay-api`
- **Status:** Building/Deploying
- **Region:** `us-central1`
- **Configuration:**
  - Memory: 1Gi (increased for Playwright support)
  - CPU: 1
  - Min instances: 0 (cost-optimized)
  - Max instances: 10
  - Concurrency: 80
  - Timeout: 300s

**Check status:**
```bash
gcloud run services describe whatsay-api --region us-central1 --project gen-lang-client-0803362165
```

---

## 📋 Remaining Tasks

### 1. Complete API Deployment
- [ ] Verify build succeeds
- [ ] Test health endpoint
- [ ] Verify database connectivity
- [ ] Test Redis connectivity

### 2. Run Database Migrations
```bash
# Connect to Cloud Run and run migrations
gcloud run jobs create whatsay-migrate \
  --image gcr.io/gen-lang-client-0803362165/whatsay-api \
  --region us-central1 \
  --add-cloudsql-instances gen-lang-client-0803362165:us-central1:whatsay-db \
  --set-secrets DATABASE_URL=database-url:latest \
  --set-env-vars NODE_ENV=production \
  --command npx \
  --args "prisma migrate deploy" \
  --project gen-lang-client-0803362165

# Execute migration
gcloud run jobs execute whatsay-migrate --region us-central1 --project gen-lang-client-0803362165
```

### 3. Deploy Worker as Cloud Run Job
```bash
gcloud run jobs create whatsay-worker \
  --image gcr.io/gen-lang-client-0803362165/whatsay-api \
  --region us-central1 \
  --add-cloudsql-instances gen-lang-client-0803362165:us-central1:whatsay-db \
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

### 4. Set Up Cloud Scheduler
```bash
# Get Cloud Run Job execution URL
JOB_URL=$(gcloud run jobs describe whatsay-worker --region us-central1 --project gen-lang-client-0803362165 --format="value(status.url)")

# Create scheduler job (runs hourly)
gcloud scheduler jobs create http whatsay-worker-hourly \
  --schedule="0 * * * *" \
  --uri="$JOB_URL/run" \
  --http-method=POST \
  --oauth-service-account=278662370606-compute@developer.gserviceaccount.com \
  --location=us-central1 \
  --project gen-lang-client-0803362165
```

### 5. Configure Firebase App Check
- [ ] Add App Check middleware to API
- [ ] Verify tokens on protected endpoints
- [ ] Test with mobile app

### 6. Set Up Monitoring & Alerts
- [ ] Cloud Monitoring dashboard
- [ ] Error rate alerts (>5% errors)
- [ ] Latency alerts (>1s p95)
- [ ] Job failure alerts
- [ ] Cost budget alerts (>$50/month)

### 7. Cost Guardrails
- [ ] Set budget: $100/month with alerts at 50%, 90%, 100%
- [ ] Enable Cloud Run min-instances=0 (already set)
- [ ] Monitor Cloud SQL auto-scaling
- [ ] Review Redis usage

---

## 🔗 Service URLs (After Deployment)

**API Base URL:** `https://whatsay-api-XXXXX-uc.a.run.app`  
**Health Check:** `https://whatsay-api-XXXXX-uc.a.run.app/health`  
**Feed Endpoint:** `https://whatsay-api-XXXXX-uc.a.run.app/api/feed`  
**Sources Endpoint:** `https://whatsay-api-XXXXX-uc.a.run.app/api/sources`

---

## 💰 Cost Estimate

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| Cloud SQL | db-f1-micro | $0-7 (free tier) |
| Redis | 1GB basic | ~$35.77 |
| Storage | 10GB Standard | ~$0.20 |
| Cloud Run API | Min 0, Max 10 | $0-20 (free tier: 2M requests) |
| Cloud Run Jobs | On-demand | ~$5-10 |
| Secret Manager | 6 secrets | ~$0.06 |
| **Total** | | **~$41-73/month** |
| **With free tier** | | **~$36-48/month** |

---

## 🔒 Security Notes

1. **Database:** Unix socket connection (no network exposure)
2. **Redis:** Public IP but requires authentication
3. **Secrets:** All in Secret Manager, Cloud Run has access
4. **API:** Public endpoints (add Firebase App Check for auth)
5. **VPC Connector:** Deferred (can add later for private IP)

---

## ✅ Checklist of Changes

- [x] Created Dockerfile for ingestion-platform
- [x] Added health check endpoint
- [x] Updated DATABASE_URL to use Unix socket
- [x] Created S3 service account and secrets
- [x] Granted Cloud Run access to all secrets
- [x] Enabled required APIs
- [x] Started API deployment
- [ ] Verify API deployment
- [ ] Run database migrations
- [ ] Deploy worker job
- [ ] Set up scheduler
- [ ] Add monitoring
- [ ] Configure Firebase App Check

---

**Last Updated:** Deployment in progress
