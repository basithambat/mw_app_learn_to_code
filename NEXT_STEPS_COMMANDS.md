# 🚀 Next Steps - Commands to Run

## Step 1: Check API Deployment Status

```bash
# Check if API is deployed
gcloud run services list --region asia-south1 --project gen-lang-client-0803362165

# Get API URL
gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(status.url)"

# Test health endpoint
curl https://whatsay-api-XXXXX-as.a.run.app/health
```

---

## Step 2: Run Database Migrations

```bash
# Get API image
API_IMAGE=$(gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(spec.template.spec.containers[0].image)")

# Create migration job
gcloud run jobs create whatsay-migrate \
  --image "$API_IMAGE" \
  --region asia-south1 \
  --add-cloudsql-instances gen-lang-client-0803362165:asia-south1:whatsay-db \
  --set-secrets DATABASE_URL=database-url:latest \
  --set-env-vars NODE_ENV=production \
  --command npx \
  --args "prisma migrate deploy" \
  --memory 512Mi \
  --cpu 1 \
  --project gen-lang-client-0803362165

# Execute migration
gcloud run jobs execute whatsay-migrate \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

---

## Step 3: Deploy Worker

```bash
# Get API image
API_IMAGE=$(gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(spec.template.spec.containers[0].image)")

# Create worker job
gcloud run jobs create whatsay-worker \
  --image "$API_IMAGE" \
  --region asia-south1 \
  --add-cloudsql-instances gen-lang-client-0803362165:asia-south1:whatsay-db \
  --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest \
  --set-env-vars NODE_ENV=production \
  --memory 512Mi \
  --cpu 1 \
  --max-retries 3 \
  --task-timeout 3600 \
  --command node \
  --args dist/worker.js \
  --project gen-lang-client-0803362165
```

**💰 Cost:** ~$5-10/month (on-demand execution)

---

## Step 4: Set Up Cloud Scheduler

```bash
# Get worker job URL
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

**💰 Cost:** FREE (up to 3 jobs)

---

## Step 5: Verify Everything Works

```bash
# Get API URL
API_URL=$(gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(status.url)")

# Test endpoints
curl "$API_URL/health"
curl "$API_URL/api/sources"
curl "$API_URL/api/feed?limit=5"

# Test worker
gcloud run jobs execute whatsay-worker \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

---

## 💰 Final Cost Summary

| Service | Monthly Cost |
|---------|--------------|
| Cloud SQL | $0-7 (free tier) |
| Redis | ~$35.77 |
| Storage | ~$0.20 |
| Cloud Run API | $0-20 (free tier) |
| Cloud Run Jobs | ~$5-10 |
| Scheduler | FREE |
| **Total** | **~$41-66/month** |

**No double charges!** ✅

---

## 📋 Checklist

- [ ] API deployed and health check passes
- [ ] Database migrations run successfully
- [ ] Worker job deployed
- [ ] Scheduler configured
- [ ] All endpoints tested
- [ ] Monitoring set up (next step)
- [ ] Firebase App Check configured (next step)

---

**All commands ready to run!** 🎯
