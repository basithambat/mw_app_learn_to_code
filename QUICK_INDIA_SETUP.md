# 🇮🇳 Quick India Setup - Mumbai Region

## One-Command Setup

```bash
cd /Users/basith/Documents/whatsay-app-main
./setup-gcp-india.sh
```

This will:
1. ✅ Create Cloud SQL in Mumbai (`asia-south1`)
2. ✅ Create Redis in Mumbai
3. ✅ Create Storage bucket in Mumbai
4. ✅ Update all secrets with Mumbai connection strings
5. ✅ Ready for deployment

**Time:** ~15-20 minutes (mostly waiting for Cloud SQL and Redis creation)

---

## After Setup: Deploy API

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

## Benefits for India Users

- 🚀 **4-6x faster** API responses (~20-100ms vs ~400-600ms)
- 🇮🇳 **Data residency** in India (compliance benefits)
- 💰 **Same cost** as US regions
- ✅ **Full GCP services** available in Mumbai

---

**Region:** `asia-south1` (Mumbai, India)  
**Ready to deploy!** 🎯
