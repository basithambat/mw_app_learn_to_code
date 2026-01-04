# ☁️ GCP Infrastructure Setup Guide - WhatSay App

## 📋 Overview

This guide covers setting up all required infrastructure in Google Cloud Platform (GCP) for the WhatSay ingestion platform backend.

**Required GCP Services:**
1. **Cloud SQL (PostgreSQL)** - Database for content items, user states
2. **Memorystore (Redis)** - Job queue for background processing
3. **Cloud Storage** - S3-compatible storage for images and media
4. **Cloud Run** - Serverless container for Node.js API
5. **Cloud Run Jobs** - Background worker process
6. **Cloud Build** - CI/CD for automated deployments
7. **Secret Manager** - Secure storage for API keys and credentials

---

## 🎯 Prerequisites

1. **GCP Account** - Sign up at https://cloud.google.com
2. **Billing Enabled** - Required for most services (free tier available)
3. **gcloud CLI** - Install: https://cloud.google.com/sdk/docs/install
4. **Project Created** - Create a new GCP project

---

## 🚀 Step-by-Step Setup

### 1. Create GCP Project

```bash
# Login to GCP
gcloud auth login

# Create new project (or use existing)
gcloud projects create whatsay-app --name="WhatSay App"

# Set as active project
gcloud config set project whatsay-app

# Enable billing (required)
# Go to: https://console.cloud.google.com/billing
# Link billing account to project
```

**Or via Console:**
1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name: `whatsay-app`
4. Enable billing

---

### 2. Enable Required APIs

```bash
# Enable all required APIs
gcloud services enable \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  storage-component.googleapis.com \
  compute.googleapis.com
```

**Or via Console:**
1. Go to **APIs & Services** → **Library**
2. Enable each service:
   - Cloud SQL Admin API
   - Memorystore for Redis API
   - Cloud Run API
   - Cloud Build API
   - Secret Manager API
   - Cloud Storage API

---

### 3. Set Up Cloud SQL (PostgreSQL)

#### Option A: Using gcloud CLI

```bash
# Create PostgreSQL instance
gcloud sql instances create whatsay-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD \
  --storage-type=SSD \
  --storage-size=20GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --enable-bin-log

# Create database
gcloud sql databases create ingestion_db --instance=whatsay-db

# Create user
gcloud sql users create app_user \
  --instance=whatsay-db \
  --password=YOUR_APP_USER_PASSWORD

# Get connection name (needed for Cloud Run)
gcloud sql instances describe whatsay-db --format="value(connectionName)"
# Output: whatsay-app:us-central1:whatsay-db
```

#### Option B: Using Console

1. Go to **SQL** → **Create Instance**
2. Choose **PostgreSQL**
3. **Instance ID:** `whatsay-db`
4. **Password:** Set root password
5. **Region:** Choose closest (e.g., `us-central1`)
6. **Machine Type:** `db-f1-micro` (free tier) or `db-n1-standard-1` (production)
7. **Storage:** 20GB SSD, enable auto-increase
8. **Backups:** Enable automated backups
9. Click **Create**

**Create Database:**
1. Click on instance → **Databases** tab
2. **Create Database:** `ingestion_db`

**Create User:**
1. Click **Users** tab
2. **Add User Account**
3. Username: `app_user`
4. Password: Set secure password

**Get Connection String:**
- Connection name: `whatsay-app:us-central1:whatsay-db`
- Format: `postgresql://app_user:password@/ingestion_db?host=/cloudsql/whatsay-app:us-central1:whatsay-db`

---

### 4. Set Up Memorystore (Redis)

#### Option A: Using gcloud CLI

```bash
# Create Redis instance
gcloud redis instances create whatsay-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0 \
  --tier=basic \
  --network=default
```

#### Option B: Using Console

1. Go to **Memorystore** → **Redis** → **Create Instance**
2. **Instance ID:** `whatsay-redis`
3. **Region:** `us-central1` (same as Cloud SQL)
4. **Tier:** Basic (1GB) or Standard (production)
5. **Redis Version:** 7.0
6. **Network:** `default` (or your VPC)
7. Click **Create**

**Get Redis URL:**
- Format: `redis://10.x.x.x:6379` (internal IP)
- Or use hostname: `whatsay-redis.c.xxxxx.internal:6379`

**Note:** Memorystore uses internal IPs. For Cloud Run, you'll need VPC connector (see below).

---

### 5. Set Up Cloud Storage (S3-Compatible)

#### Option A: Using gcloud CLI

```bash
# Create storage bucket
gsutil mb -p whatsay-app -c STANDARD -l us-central1 gs://whatsay-content

# Make bucket public for media (optional, or use signed URLs)
gsutil iam ch allUsers:objectViewer gs://whatsay-content

# Create service account for app access
gcloud iam service-accounts create whatsay-storage \
  --display-name="WhatSay Storage Service Account"

# Grant storage access
gsutil iam ch serviceAccount:whatsay-storage@whatsay-app.iam.gserviceaccount.com:objectAdmin gs://whatsay-content
```

#### Option B: Using Console

1. Go to **Cloud Storage** → **Buckets** → **Create Bucket**
2. **Name:** `whatsay-content`
3. **Location Type:** Region
4. **Region:** `us-central1`
5. **Storage Class:** Standard
6. **Access Control:** Uniform
7. Click **Create**

**Set Public Access (Optional):**
1. Click bucket → **Permissions** tab
2. **Add Principal:** `allUsers`
3. **Role:** Storage Object Viewer
4. Click **Save**

**Create Service Account:**
1. Go to **IAM & Admin** → **Service Accounts**
2. **Create Service Account**
3. Name: `whatsay-storage`
4. **Grant Access:**
   - Role: `Storage Object Admin`
   - Click **Done**

**Get Access Keys:**
1. Click service account → **Keys** tab
2. **Add Key** → **Create New Key** → **JSON**
3. Download JSON file (contains access key and secret)

---

### 6. Set Up VPC Connector (For Redis Access)

Cloud Run needs VPC connector to access Memorystore (Redis).

```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create whatsay-connector \
  --region=us-central1 \
  --subnet=default \
  --subnet-project=whatsay-app \
  --min-instances=2 \
  --max-instances=3 \
  --machine-type=e2-micro
```

**Or via Console:**
1. Go to **Serverless VPC Access** → **Create Connector**
2. **Name:** `whatsay-connector`
3. **Region:** `us-central1`
4. **Network:** `default`
5. **Subnet:** `default`
6. **Min/Max Instances:** 2-3
7. Click **Create**

---

### 7. Set Up Secret Manager

Store sensitive credentials securely.

```bash
# Create secrets
echo -n "postgresql://app_user:password@/ingestion_db?host=/cloudsql/whatsay-app:us-central1:whatsay-db" | \
  gcloud secrets create database-url --data-file=-

echo -n "redis://10.x.x.x:6379" | \
  gcloud secrets create redis-url --data-file=-

# Add service account access
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:whatsay-api@whatsay-app.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Or via Console:**
1. Go to **Secret Manager** → **Create Secret**
2. Create secrets:
   - `database-url` - PostgreSQL connection string
   - `redis-url` - Redis connection string
   - `firebase-service-account` - Firebase Admin SDK JSON
   - `google-api-key` - Gemini API key
   - `s3-access-key` - Cloud Storage access key
   - `s3-secret-key` - Cloud Storage secret key

---

### 8. Set Up Cloud Run (API Server)

#### Option A: Using gcloud CLI

```bash
# Build and deploy
cd ingestion-platform

# Build container
gcloud builds submit --tag gcr.io/whatsay-app/whatsay-api

# Deploy to Cloud Run
gcloud run deploy whatsay-api \
  --image gcr.io/whatsay-app/whatsay-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances whatsay-app:us-central1:whatsay-db \
  --vpc-connector whatsay-connector \
  --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300
```

#### Option B: Using Console

1. Go to **Cloud Run** → **Create Service**
2. **Service Name:** `whatsay-api`
3. **Region:** `us-central1`
4. **Deploy:** 
   - **Container Image:** Build from source or use existing
   - **Source:** Connect GitHub repo, select `ingestion-platform` directory
5. **Configuration:**
   - **Memory:** 512 MiB
   - **CPU:** 1
   - **Min Instances:** 0
   - **Max Instances:** 10
   - **Timeout:** 300s
6. **Connections:**
   - **Cloud SQL:** Add `whatsay-db` instance
   - **VPC Connector:** `whatsay-connector`
7. **Secrets:**
   - Add `DATABASE_URL` from Secret Manager
   - Add `REDIS_URL` from Secret Manager
8. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=8080
   APP_BASE_URL=https://whatsay-api-xxxxx.run.app
   S3_ENDPOINT=https://storage.googleapis.com
   S3_BUCKET=whatsay-content
   S3_REGION=us-central1
   ```
9. **Authentication:** Allow unauthenticated (or set IAM)
10. Click **Create**

**Get Service URL:**
- Format: `https://whatsay-api-xxxxx-uc.a.run.app`

---

### 9. Set Up Cloud Run Jobs (Worker Process)

```bash
# Deploy worker as Cloud Run Job
gcloud run jobs create whatsay-worker \
  --image gcr.io/whatsay-app/whatsay-api \
  --region us-central1 \
  --add-cloudsql-instances whatsay-app:us-central1:whatsay-db \
  --vpc-connector whatsay-connector \
  --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest \
  --set-env-vars NODE_ENV=production \
  --memory 512Mi \
  --cpu 1 \
  --max-retries 3 \
  --task-timeout 3600 \
  --command node \
  --args dist/worker.js
```

**Or via Console:**
1. Go to **Cloud Run** → **Jobs** → **Create Job**
2. **Job Name:** `whatsay-worker`
3. **Container:** Same image as API
4. **Command:** `node dist/worker.js`
5. **Configuration:** Same as API (Cloud SQL, VPC, Secrets)
6. **Schedule (Optional):** Set up Cloud Scheduler to run periodically

**Set Up Cloud Scheduler (Optional):**
```bash
# Create scheduled job execution
gcloud scheduler jobs create http whatsay-worker-schedule \
  --schedule="*/5 * * * *" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/whatsay-app/jobs/whatsay-worker:run" \
  --http-method=POST \
  --oauth-service-account=whatsay-api@whatsay-app.iam.gserviceaccount.com
```

---

### 10. Set Up Cloud Build (CI/CD)

#### Create cloudbuild.yaml

```yaml
# ingestion-platform/cloudbuild.yaml
steps:
  # Build container
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/whatsay-api', '.']
  
  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/whatsay-api']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'whatsay-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/whatsay-api'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--add-cloudsql-instances'
      - 'whatsay-app:us-central1:whatsay-db'
      - '--vpc-connector'
      - 'whatsay-connector'
      - '--set-secrets'
      - 'DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest'
      - '--set-env-vars'
      - 'NODE_ENV=production,PORT=8080'

images:
  - 'gcr.io/$PROJECT_ID/whatsay-api'
```

**Enable Cloud Build:**
1. Go to **Cloud Build** → **Triggers** → **Create Trigger**
2. **Name:** `whatsay-api-deploy`
3. **Source:** Connect GitHub repo
4. **Branch:** `master` or `main`
5. **Configuration:** Cloud Build configuration file
6. **Location:** `ingestion-platform/cloudbuild.yaml`
7. Click **Create**

---

### 11. Run Database Migrations

```bash
# Connect to Cloud Run service
gcloud run services update whatsay-api \
  --add-cloudsql-instances whatsay-app:us-central1:whatsay-db

# Run migrations via Cloud Run
gcloud run jobs create migrate-db \
  --image gcr.io/whatsay-app/whatsay-api \
  --region us-central1 \
  --add-cloudsql-instances whatsay-app:us-central1:whatsay-db \
  --set-secrets DATABASE_URL=database-url:latest \
  --command npx \
  --args prisma,migrate,deploy

# Execute migration job
gcloud run jobs execute migrate-db --region us-central1
```

---

## 📝 Environment Variables Summary

### Required Secrets (Secret Manager):
- `database-url` - PostgreSQL connection string
- `redis-url` - Redis connection string
- `firebase-service-account` - Firebase Admin SDK JSON
- `google-api-key` - Gemini API key (optional)
- `s3-access-key` - Cloud Storage access key
- `s3-secret-key` - Cloud Storage secret key

### Environment Variables (Cloud Run):
```bash
NODE_ENV=production
PORT=8080
APP_BASE_URL=https://whatsay-api-xxxxx.run.app
S3_ENDPOINT=https://storage.googleapis.com
S3_BUCKET=whatsay-content
S3_PUBLIC_BASE_URL=https://storage.googleapis.com/whatsay-content
S3_REGION=us-central1
ENABLE_SCHEDULER=true
```

---

## 💰 Cost Estimation

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Cloud SQL** | db-f1-micro (free tier) | $0 (or $7-15 for production) |
| **Memorystore Redis** | Basic 1GB | ~$30 |
| **Cloud Storage** | 50GB Standard | ~$1 |
| **Cloud Run** | 1M requests, 360K GB-seconds | ~$0-10 (free tier) |
| **Cloud Run Jobs** | Minimal usage | ~$0-5 |
| **VPC Connector** | 2-3 instances | ~$10-15 |
| **Secret Manager** | 6 secrets | ~$0.06 |
| **Cloud Build** | 100 builds/month | ~$0-10 (free tier) |
| **Total** | | **~$40-60/month** |

**Free Tier Available:**
- Cloud SQL: db-f1-micro (limited)
- Cloud Run: 2M requests/month
- Cloud Build: 120 build-minutes/day
- Cloud Storage: 5GB/month

---

## 🔒 Security Checklist

- [ ] **Cloud SQL:** Use private IP, restrict access
- [ ] **Memorystore:** Private IP only, VPC connector
- [ ] **Cloud Storage:** Use IAM, signed URLs for private content
- [ ] **Secrets:** Store all credentials in Secret Manager
- [ ] **Cloud Run:** Set IAM permissions, use service accounts
- [ ] **CORS:** Configure in API for production domains
- [ ] **SSL/HTTPS:** Automatic with Cloud Run
- [ ] **Backups:** Enable automated Cloud SQL backups

---

## 🧪 Testing

### Test API Endpoint:
```bash
# Get service URL
gcloud run services describe whatsay-api --region us-central1 --format="value(status.url)"

# Test endpoint
curl https://whatsay-api-xxxxx.run.app/api/sources
```

### Test Database Connection:
```bash
# Connect via Cloud SQL Proxy
cloud_sql_proxy -instances=whatsay-app:us-central1:whatsay-db=tcp:5432

# Run Prisma Studio
DATABASE_URL="postgresql://app_user:password@localhost:5432/ingestion_db" npx prisma studio
```

---

## 📚 Next Steps

1. **Deploy Code:** Push to GitHub, Cloud Build will auto-deploy
2. **Run Migrations:** Execute migration job
3. **Test Endpoints:** Verify API is working
4. **Update Frontend:** Point to Cloud Run URL
5. **Monitor:** Set up Cloud Monitoring alerts
6. **Scale:** Adjust Cloud Run instances as needed

---

## 🆘 Troubleshooting

### Cloud Run Can't Connect to Cloud SQL
- Ensure Cloud SQL instance is added to Cloud Run service
- Check connection name format: `project:region:instance`

### Cloud Run Can't Connect to Redis
- Ensure VPC connector is configured
- Check Redis network settings
- Verify VPC connector region matches Cloud Run

### Build Failures
- Check Cloud Build logs
- Verify Dockerfile is correct
- Ensure all dependencies are in package.json

---

## 🎯 Quick Start Commands

```bash
# 1. Set project
gcloud config set project whatsay-app

# 2. Enable APIs
gcloud services enable sqladmin.googleapis.com redis.googleapis.com run.googleapis.com

# 3. Create Cloud SQL
gcloud sql instances create whatsay-db --database-version=POSTGRES_15 --tier=db-f1-micro --region=us-central1

# 4. Create Redis
gcloud redis instances create whatsay-redis --size=1 --region=us-central1 --tier=basic

# 5. Create Storage Bucket
gsutil mb -p whatsay-app -l us-central1 gs://whatsay-content

# 6. Create VPC Connector
gcloud compute networks vpc-access connectors create whatsay-connector --region=us-central1 --subnet=default

# 7. Deploy API
gcloud run deploy whatsay-api --source . --region us-central1 --add-cloudsql-instances whatsay-app:us-central1:whatsay-db --vpc-connector whatsay-connector
```

---

**Need help?** I can guide you through any specific step or troubleshoot issues! 🚀
