# 🔐 Credentials and Configuration Reference

**⚠️ IMPORTANT: This document contains sensitive credentials. Keep it secure and never commit to public repositories.**

This document contains all credentials and configuration information needed to continue working on this project with another coding agent.

---

## 📍 PROJECT LOCATION (IMPORTANT)

**⚠️ LOCAL PROJECT PATH:**
```
/Users/basith/Documents/whatsay-app-main
```

**Always use this absolute path when working with files in this project.**

- **Git Remote:** `https://github.com/futureflux/whatsay-app.git` (Note: Repository not found - may need to be created or updated)

---

## ☁️ Google Cloud Platform (GCP) Credentials

### Project Information
- **Project ID:** `gen-lang-client-0803362165`
- **Project Number:** `278662370606`
- **Primary Region:** `asia-south1` (Mumbai, India)
- **Alternative Region:** `us-central1` (US - resources deleted to avoid double charges)

### GCP Console Links
- **Main Console:** https://console.cloud.google.com/?project=gen-lang-client-0803362165
- **Cloud Run:** https://console.cloud.google.com/run?project=gen-lang-client-0803362165
- **Cloud Build:** https://console.cloud.google.com/cloud-build/builds?project=gen-lang-client-0803362165
- **API Library:** https://console.cloud.google.com/apis/library?project=gen-lang-client-0803362165

### Deployed Services
- **API URL (Current):** `https://whatsay-api-278662370606.asia-south1.run.app`
- **API URL (Previous):** `https://whatsay-api-jsewdobsva-el.a.run.app` (may still be active)
- **Service Name:** `whatsay-api`
- **Region:** `asia-south1`
- **Migration Job:** `whatsay-migrate`
- **Worker Job:** `whatsay-worker`
- **Local Development:** `http://localhost:3000` (for emulator) or `http://192.168.0.101:3000` (for physical device)

### GCP Infrastructure
- **Cloud SQL Instance:** `whatsay-db` (PostgreSQL)
  - Connection: `gen-lang-client-0803362165:asia-south1:whatsay-db`
  - Database: `ingestion_db`
  - User: `app_user`
- **Redis Instance:** `whatsay-redis` (Memorystore)
  - Region: `asia-south1`
  - Size: 1GB basic tier
- **Storage Bucket:** `whatsay-content`
- **VPC Connector:** `whatsay-connector`
- **Service Account:** `278662370606-compute@developer.gserviceaccount.com`

### GCP APIs Enabled
The following APIs should be enabled in the project:
1. Service Usage API
2. Cloud SQL Admin API
3. Memorystore for Redis API
4. Cloud Run API
5. Secret Manager API
6. Cloud Storage API
7. Compute Engine API
8. Serverless VPC Access API
9. Cloud Build API

### GCP Secret Manager
Secrets are stored in GCP Secret Manager. The following secrets should exist:
- `database-url` - PostgreSQL connection string
- `redis-url` - Redis connection string
- `firebase-service-account` - Firebase Admin SDK JSON
- `google-api-key` - Gemini API key
- `s3-access-key` - Cloud Storage access key
- `s3-secret-key` - Cloud Storage secret key

**Note:** Actual secret values are stored in GCP Secret Manager and should be retrieved using:
```bash
gcloud secrets versions access latest --secret=<secret-name> --project=gen-lang-client-0803362165
```

---

## 🔥 Firebase Configuration

### Firebase Project
- **Project ID:** `whatsay-app-c3627`
- **Console:** https://console.firebase.google.com/project/whatsay-app-c3627

### Firebase iOS Configuration
- **Bundle ID:** `com.safwanambat.whatsay`
- **Client ID:** `892528727267-fureil15ns3h1qnhn4n2t9vud1d6mrsp.apps.googleusercontent.com`
- **Reversed Client ID:** `com.googleusercontent.apps.892528727267-fureil15ns3h1qnhn4n2t9vud1d6mrsp`
- **Google App ID:** `1:892528727267:ios:9c2cd51fb5bd9c8b0021d6`
- **GCM Sender ID:** `892528727267`
- **Storage Bucket:** `whatsay-app-c3627.firebasestorage.app`
- **API Key:** `AIzaSyCC_n0oJRZMZCK9ezvsMtAft0JgdVQ3FOg`

### Firebase Android Configuration
- **Package Name:** `com.safwanambat.whatsay`
- **Android Client ID:** `892528727267-k9t8flu0dl5o3apv9qr2lnjr4bppf0q4.apps.googleusercontent.com`
- **Google Services File:** `android/app/google-services.json` (contains project_id: `whatsay-app-c3627`)

### Firebase Admin SDK
**Required for Backend Authentication:**
- A Firebase service account JSON file is needed
- Should be obtained from: Firebase Console → Project Settings → Service accounts → Node.js tab → Generate new private key
- The JSON should be stored as environment variable `FIREBASE_SERVICE_ACCOUNT` (as a single-line string)
- Or stored in GCP Secret Manager as `firebase-service-account`

**To get the service account:**
1. Go to: https://console.firebase.google.com/project/whatsay-app-c3627/settings/serviceaccounts/adminsdk
2. Click "Node.js" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Use the entire JSON content as `FIREBASE_SERVICE_ACCOUNT` environment variable

---

## 📱 Mobile App Configuration

### App Identifiers
- **Package Name (Android):** `com.safwanambat.whatsay`
- **Bundle ID (iOS):** `com.safwanambat.whatsay`
- **App Name:** `whatsay`
- **App Version:** `2.8`
- **Android Version Code:** `11`
- **iOS Build Number:** `17`

### EAS (Expo Application Services)
- **Project ID:** `36e03653-504c-4109-8021-77b24410fdb5`
- **Build Profiles:** `development`, `preview`, `production`, `androidapk`

### Apple Developer
- **Apple ID:** `safwanambat@gmail.com`
- **Apple Team ID:** `HDLYD4QM4F`
- **ASC App ID:** `6737504537`

---

## 🔑 API Keys and Environment Variables

### Required Environment Variables (Backend)

These should be set in GCP Secret Manager or as environment variables in Cloud Run:

#### Database & Cache
- `DATABASE_URL` - PostgreSQL connection string (stored in Secret Manager as `database-url`)
- `REDIS_URL` - Redis connection string (stored in Secret Manager as `redis-url`)

#### Third-Party APIs
- `FIRECRAWL_API_KEY` - Firecrawl API key (format: `fc_YOUR_KEY_HERE`)
- `GOOGLE_API_KEY` - Google Gemini API key (for LLM rewriting)
- `MISTRAL_API_KEY` - (Optional) Mistral API key
- `OPENAI_API_KEY` - (Optional) OpenAI API key
- `SERPAPI_KEY` - (Optional) SerpAPI key for image search
- `SERPER_API_KEY` - (Optional) Serper API key for image search
- `NANO_BANANA_API_KEY` - (Optional) Nano Banana API key for image generation

#### Firebase
- `FIREBASE_SERVICE_ACCOUNT` - Complete Firebase Admin SDK JSON as single-line string (stored in Secret Manager as `firebase-service-account`)

#### Storage (S3/Cloud Storage)
- `S3_ENDPOINT` - S3 endpoint URL (for Cloud Storage: `https://storage.googleapis.com`)
- `S3_ACCESS_KEY` - Cloud Storage access key (stored in Secret Manager as `s3-access-key`)
- `S3_SECRET_KEY` - Cloud Storage secret key (stored in Secret Manager as `s3-secret-key`)
- `S3_BUCKET` - Storage bucket name (`whatsay-content`)
- `S3_PUBLIC_BASE_URL` - Public base URL for stored content
- `S3_REGION` - Storage region (default: `us-east-1`)

#### Application
- `APP_BASE_URL` - Base URL of the API (default: `http://localhost:3000`)
- `PORT` - Server port (default: `3000`)
- `NODE_ENV` - Environment (`development`, `production`, or `test`)
- `ENABLE_SCHEDULER` - Enable scheduled jobs (`true` or `false`)

### Environment File Location
- **Example File:** `ingestion-platform/env.example`
- **Actual File:** `ingestion-platform/.env` (should not be committed to git)

---

## 🗄️ Database Configuration

### Cloud SQL (PostgreSQL)
- **Instance Name:** `whatsay-db`
- **Project:** `gen-lang-client-0803362165`
- **Region:** `asia-south1`
- **Connection Name:** `gen-lang-client-0803362165:asia-south1:whatsay-db`
- **Database Name:** `ingestion_db`
- **User:** `app_user`
- **Connection String Format:** `postgresql://app_user:password@/ingestion_db?host=/cloudsql/gen-lang-client-0803362165:asia-south1:whatsay-db`

### Redis (Memorystore)
- **Instance Name:** `whatsay-redis`
- **Region:** `asia-south1`
- **Size:** 1GB basic tier
- **Connection:** Internal IP (accessed via VPC connector)

---

## 🚀 Deployment Information

### Cloud Run Deployment
```bash
# Deploy API
gcloud run deploy whatsay-api \
  --source . \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --add-cloudsql-instances gen-lang-client-0803362165:asia-south1:whatsay-db \
  --vpc-connector whatsay-connector \
  --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest
```

### Run Migrations
```bash
gcloud run jobs execute whatsay-migrate \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

### Check Deployment Status
```bash
# Check API service
gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165

# Get API URL
gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(status.url)"
```

---

## 📝 Important Notes

### Security
1. **Never commit actual credentials to git**
2. **Use GCP Secret Manager for production secrets**
3. **Keep Firebase service account JSON secure**
4. **Rotate API keys periodically**

### Getting Started with New Agent
1. Authenticate with GCP:
   ```bash
   gcloud auth login
   gcloud config set project gen-lang-client-0803362165
   ```

2. Retrieve secrets from Secret Manager:
   ```bash
   gcloud secrets versions access latest --secret=database-url --project=gen-lang-client-0803362165
   gcloud secrets versions access latest --secret=redis-url --project=gen-lang-client-0803362165
   # ... etc for other secrets
   ```

3. Set up local environment:
   - Copy `ingestion-platform/env.example` to `ingestion-platform/.env`
   - Fill in values from Secret Manager or ask user for values

4. For Firebase Admin SDK:
   - User needs to download service account JSON from Firebase Console
   - Add to `.env` as `FIREBASE_SERVICE_ACCOUNT` (single-line JSON string)

### Missing Credentials
The following credentials may need to be obtained from the user:
- Firebase service account JSON (needs to be downloaded from Firebase Console)
- FIRECRAWL_API_KEY (if not already set in Secret Manager)
- GOOGLE_API_KEY (Gemini API key)
- Other optional API keys (Mistral, OpenAI, SerpAPI, etc.)

---

## 🔗 Quick Links

- **GCP Console:** https://console.cloud.google.com/?project=gen-lang-client-0803362165
- **Firebase Console:** https://console.firebase.google.com/project/whatsay-app-c3627
- **Cloud Run Services:** https://console.cloud.google.com/run?project=gen-lang-client-0803362165
- **Secret Manager:** https://console.cloud.google.com/security/secret-manager?project=gen-lang-client-0803362165
- **Cloud Build:** https://console.cloud.google.com/cloud-build/builds?project=gen-lang-client-0803362165
- **API URL (Current):** https://whatsay-api-278662370606.asia-south1.run.app
- **API URL (Previous):** https://whatsay-api-jsewdobsva-el.a.run.app

## 📝 Additional Actual Values Found in Codebase

### Frontend API Configuration
- **File:** `api/apiIngestion.ts`
- **Current Production URL:** `https://whatsay-api-jsewdobsva-el.a.run.app` (needs update to current URL)
- **Local Dev IP:** `192.168.0.101:3000` (for physical devices - update if IP changes)
- **Local Dev:** `localhost:3000` (for emulator)

### Content Sources
- **Primary Source:** `inshorts` (Inshorts news aggregator)
- **Supported Categories:** all, business, sports, technology, entertainment, science, health, world

### Database Models (Prisma)
All models are defined in `ingestion-platform/prisma/schema.prisma`:
- ContentItem, Edition, EditionStory, ExploreItem
- User, Persona, Post, Comment, CommentVote, CommentReport
- UserBlock, UserDevice
- CategoryPreference, CategoryRankingSignal
- IngestionRun, SourceState, ImageSearchCache

### Third-Party Service URLs
- **Firecrawl API:** `https://api.firecrawl.dev`
- **Google Gemini API:** `https://generativelanguage.googleapis.com/v1beta`
- **SerpAPI Images:** `https://serpapi.com/search.json`
- **Serper Images:** `https://google.serper.dev/images`

---

## 🎯 CRITICAL VALUES SUMMARY (Quick Reference)

### Project Location
```
/Users/basith/Documents/whatsay-app-main
```

### GCP
- **Project ID:** `gen-lang-client-0803362165`
- **Project Number:** `278662370606`
- **Region:** `asia-south1` (Mumbai)
- **API URL:** `https://whatsay-api-278662370606.asia-south1.run.app`

### Firebase
- **Project ID:** `whatsay-app-c3627`
- **API Key:** `AIzaSyCC_n0oJRZMZCK9ezvsMtAft0JgdVQ3FOg`
- **GCM Sender ID:** `892528727267`

### App Identifiers
- **Package/Bundle ID:** `com.safwanambat.whatsay`
- **EAS Project ID:** `36e03653-504c-4109-8021-77b24410fdb5`

### Apple Developer
- **Apple ID:** `safwanambat@gmail.com`
- **Team ID:** `HDLYD4QM4F`
- **ASC App ID:** `6737504537`

### API Endpoints
- **Production:** `https://whatsay-api-278662370606.asia-south1.run.app`
- **Local:** `http://localhost:3000` or `http://192.168.0.101:3000`

### Database
- **Instance:** `whatsay-db`
- **Database:** `ingestion_db`
- **Connection:** `gen-lang-client-0803362165:asia-south1:whatsay-db`

### Infrastructure
- **Redis:** `whatsay-redis` (asia-south1)
- **Storage:** `whatsay-content` bucket
- **VPC Connector:** `whatsay-connector`

---

**Last Updated:** Generated automatically for handoff to new coding agent
**Project:** WhatSay App
**Status:** Production deployment in Mumbai (asia-south1)
