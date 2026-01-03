# ⚡ Backend Deployment - Quick Start

## 🚀 Fastest Path: Railway (15 minutes)

### Step 1: Sign Up & Install
```bash
# 1. Go to https://railway.app and sign up
# 2. Install Railway CLI
npm i -g @railway/cli

# 3. Login
railway login
```

### Step 2: Deploy Infrastructure
```bash
cd ingestion-platform

# Initialize Railway project
railway init

# Add PostgreSQL (in Railway dashboard: + New → Database → PostgreSQL)
# Add Redis (in Railway dashboard: + New → Database → Redis)
```

### Step 3: Set Environment Variables

In Railway dashboard → Your Service → Variables, add:

```bash
# Database (from Railway PostgreSQL)
DATABASE_URL=postgresql://...

# Redis (from Railway Redis)
REDIS_URL=redis://...

# App Config
PORT=3000
NODE_ENV=production
APP_BASE_URL=https://your-app.railway.app

# S3 Storage (use Railway storage or external)
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_BUCKET=content-bucket
S3_PUBLIC_BASE_URL=https://your-s3-public-url.com
S3_REGION=us-east-1

# LLM (your existing keys)
GOOGLE_API_KEY=your-gemini-key

# Firebase (your existing service account JSON)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Optional
ENABLE_SCHEDULER=true
```

### Step 4: Deploy & Migrate
```bash
# Deploy code
railway up

# Run database migrations
railway run npx prisma migrate deploy
```

### Step 5: Deploy Worker

1. In Railway dashboard → **+ New** → **Service**
2. Same repo, same directory
3. **Start Command:** `node dist/worker.js`
4. Same environment variables

### Step 6: Get Your URL

```bash
railway domain
# Or check Railway dashboard → Settings → Domains
```

### Step 7: Update Frontend

**File:** `api/apiIngestion.ts`

```typescript
export const getIngestionApiBase = () => {
  if (__DEV__) {
    return 'http://192.168.0.101:3000';
  }
  return 'https://your-app.railway.app'; // Your Railway URL
};
```

---

## ✅ Test Your Deployment

```bash
# Test API
curl https://your-app.railway.app/api/sources

# Test feed
curl https://your-app.railway.app/api/feed?limit=5
```

---

## 🎯 That's It!

Your backend is now live and ready for production! 🚀

**Next:** Update frontend API URL and build production app.

---

For detailed guide, see: `BACKEND_DEPLOYMENT_GUIDE.md`
