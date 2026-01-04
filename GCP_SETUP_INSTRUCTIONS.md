# GCP Setup Instructions - Project Number: 278662370606

## What I Need From You

To proceed with the GCP infrastructure setup, I need one of the following:

### Option 1: Project ID (Easiest)
**Provide your GCP Project ID** (not the number, but the ID like `my-project-12345`)

You can find it by running:
```bash
gcloud projects list --filter="projectNumber:278662370606"
```

Or check in GCP Console: https://console.cloud.google.com

Once you provide the PROJECT_ID, I can run:
```bash
./setup-gcp-with-project.sh [YOUR_PROJECT_ID]
```

---

### Option 2: Service Account Key (For Automated Setup)
If you want me to run everything automatically, create a service account with these permissions:

**Required Roles:**
- `roles/owner` (or individual roles below)
- `roles/cloudsql.admin`
- `roles/redis.admin`
- `roles/run.admin`
- `roles/storage.admin`
- `roles/secretmanager.admin`
- `roles/compute.networkAdmin`
- `roles/serviceusage.serviceUsageAdmin`

**Steps:**
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=[YOUR_PROJECT_ID]
2. Create Service Account: `whatsay-setup`
3. Grant the roles above
4. Create Key (JSON)
5. Share the JSON file content (I'll use it for authentication)

Then I can run everything automatically.

---

### Option 3: You Run It (Recommended)
**Easiest approach - you authenticate and I guide you:**

1. **Authenticate:**
   ```bash
   gcloud auth login
   ```

2. **Find your Project ID:**
   ```bash
   gcloud projects list --filter="projectNumber:278662370606"
   ```
   Copy the PROJECT_ID from the output.

3. **Run the setup script:**
   ```bash
   cd /Users/basith/Documents/whatsay-app-main
   ./setup-gcp-with-project.sh [YOUR_PROJECT_ID]
   ```

The script will:
- ✅ Enable all required APIs
- ✅ Create Cloud SQL (PostgreSQL)
- ✅ Create Redis (Memorystore)
- ✅ Create Storage Bucket
- ✅ Create VPC Connector
- ✅ Set up Secret Manager
- ✅ Configure all permissions

**Time:** ~20-30 minutes (most time is waiting for resources to provision)

---

## What Gets Created

1. **Cloud SQL (PostgreSQL)**
   - Instance: `whatsay-db`
   - Database: `ingestion_db`
   - User: `app_user`
   - Auto-generated secure passwords

2. **Memorystore (Redis)**
   - Instance: `whatsay-redis`
   - 1GB basic tier
   - Internal IP access

3. **Cloud Storage**
   - Bucket: `whatsay-content`
   - Service account for access

4. **VPC Connector**
   - Name: `whatsay-connector`
   - Enables Cloud Run → Redis connection

5. **Secret Manager**
   - `database-url` - PostgreSQL connection string
   - `redis-url` - Redis connection string

---

## After Setup

Once infrastructure is created, you'll need to:

1. **Update additional secrets:**
   - Firebase service account JSON
   - Google API key (Gemini)
   - S3 access keys (if using external storage)

2. **Deploy your API:**
   ```bash
   cd ingestion-platform
   gcloud run deploy whatsay-api --source . --region us-central1
   ```

3. **Run migrations:**
   ```bash
   gcloud run jobs create migrate-db --image gcr.io/[PROJECT_ID]/whatsay-api
   ```

---

## Quick Start

**Just provide your PROJECT_ID and I'll run everything!**

Example:
```
PROJECT_ID: whatsay-app-12345
```

Or if you prefer, authenticate yourself and run:
```bash
./setup-gcp-with-project.sh [PROJECT_ID]
```
