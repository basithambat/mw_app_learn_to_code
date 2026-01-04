# Exact Commands to Run - GCP Setup

## Project Details
- **Project ID:** `gen-lang-client-0803362165`
- **Project Number:** `278662370606`

## 🚀 Run These Commands in Order

### 1. Authenticate (if needed)
```bash
gcloud auth login
```
This will open a browser for you to sign in.

### 2. Set the Project
```bash
gcloud config set project gen-lang-client-0803362165
```

### 3. Run the Setup Script
```bash
cd /Users/basith/Documents/whatsay-app-main
./setup-gcp-with-project.sh gen-lang-client-0803362165
```

**That's it!** The script will:
- ✅ Enable all required APIs
- ✅ Create Cloud SQL (PostgreSQL) - takes ~5-10 min
- ✅ Create Redis (Memorystore) - takes ~10-15 min  
- ✅ Create Storage Bucket
- ✅ Create VPC Connector - takes ~5-10 min
- ✅ Set up Secret Manager
- ✅ Configure all permissions

**Total time:** ~20-30 minutes (mostly waiting for resources)

---

## 📋 What Gets Created

1. **Cloud SQL Instance:** `whatsay-db`
   - Database: `ingestion_db`
   - User: `app_user`
   - Auto-generated secure passwords (save these!)

2. **Redis Instance:** `whatsay-redis`
   - 1GB basic tier
   - Internal IP access

3. **Storage Bucket:** `whatsay-content`
   - Public read access for media

4. **VPC Connector:** `whatsay-connector`
   - Enables Cloud Run → Redis connection

5. **Secrets:**
   - `database-url` - PostgreSQL connection string
   - `redis-url` - Redis connection string

---

## ⚠️ Important Notes

- **Save the passwords** that the script generates for Cloud SQL
- The script will show connection details at the end
- If any step fails, check the error message and retry

---

## 🔄 Alternative: One-Line Setup

If you're already authenticated:
```bash
gcloud config set project gen-lang-client-0803362165 && cd /Users/basith/Documents/whatsay-app-main && ./setup-gcp-with-project.sh gen-lang-client-0803362165
```

---

**Ready? Just run the 3 commands above!** 🎯
