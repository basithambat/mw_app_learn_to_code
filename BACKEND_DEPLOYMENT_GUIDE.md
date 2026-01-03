# 🚀 Backend Deployment Guide - Ingestion Platform

## 📋 Overview

This guide covers deploying your ingestion platform backend to production before releasing your app to the Play Store.

**What needs to be deployed:**
1. **PostgreSQL Database** - Stores content items, user states, etc.
2. **Redis** - Job queue for background processing
3. **S3-Compatible Storage** - Stores images and media
4. **Node.js API Server** - Fastify API serving feeds
5. **Worker Process** - Background job processor

---

## 🎯 Deployment Options

### Option 1: Railway (Recommended - Easiest) ⭐

**Best for:** Quick deployment, managed services, free tier available

**Pros:**
- ✅ One-click PostgreSQL, Redis setup
- ✅ Automatic SSL/HTTPS
- ✅ Simple environment variable management
- ✅ Free tier: $5 credit/month
- ✅ Easy scaling

**Steps:**

1. **Sign up:** https://railway.app
2. **Create New Project**
3. **Add Services:**
   - PostgreSQL (one-click)
   - Redis (one-click)
   - New Service (for your Node.js app)

4. **Deploy Code:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Link project
   cd ingestion-platform
   railway link
   
   # Deploy
   railway up
   ```

5. **Set Environment Variables:**
   - In Railway dashboard, add all variables from `.env`
   - Update `DATABASE_URL` to Railway's Postgres URL
   - Update `REDIS_URL` to Railway's Redis URL
   - Set `S3_ENDPOINT` to Railway's storage or external S3

6. **Run Migrations:**
   ```bash
   railway run npx prisma migrate deploy
   ```

**Cost:** ~$5-20/month (depending on usage)

---

### Option 2: Render (Free Tier Available)

**Best for:** Free tier, simple deployment

**Pros:**
- ✅ Free PostgreSQL (90 days, then $7/month)
- ✅ Free Redis (limited)
- ✅ Automatic SSL
- ✅ Easy GitHub integration

**Steps:**

1. **Sign up:** https://render.com
2. **Create PostgreSQL:**
   - New → PostgreSQL
   - Name: `whatsay-db`
   - Plan: Free (or paid)

3. **Create Redis:**
   - New → Redis
   - Name: `whatsay-redis`
   - Plan: Free (or paid)

4. **Create Web Service:**
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `ingestion-platform`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node

5. **Set Environment Variables:**
   - Add all from `.env`
   - Use Render's database URLs

6. **Create Background Worker:**
   - New → Background Worker
   - Same repo, root directory
   - Start Command: `node dist/worker.js`

**Cost:** Free tier available, then ~$7-25/month

---

### Option 3: DigitalOcean (More Control)

**Best for:** Full control, predictable pricing

**Pros:**
- ✅ Managed PostgreSQL ($15/month)
- ✅ Managed Redis ($15/month)
- ✅ Spaces (S3-compatible) ($5/month)
- ✅ App Platform or Droplets

**Steps:**

1. **Sign up:** https://digitalocean.com
2. **Create Database:**
   - Databases → Create → PostgreSQL
   - Plan: Basic ($15/month)

3. **Create Redis:**
   - Databases → Create → Redis
   - Plan: Basic ($15/month)

4. **Create Spaces (S3):**
   - Spaces → Create
   - Region: Choose closest
   - Plan: $5/month for 250GB

5. **Deploy App:**
   - **Option A: App Platform (Easiest)**
     - Apps → Create → GitHub
     - Select repo, `ingestion-platform` directory
     - Build: `npm install && npm run build`
     - Run: `npm start`
   
   - **Option B: Droplet (More Control)**
     - Create Ubuntu Droplet
     - Install Node.js, PM2
     - Clone repo, deploy

**Cost:** ~$35-50/month

---

### Option 4: AWS (Enterprise Scale)

**Best for:** Large scale, enterprise needs

**Services:**
- RDS PostgreSQL
- ElastiCache Redis
- S3 for storage
- EC2 or ECS for app
- CloudFront for CDN

**Cost:** ~$50-200/month (depending on usage)

---

## 📝 Step-by-Step: Railway Deployment (Recommended)

### 1. Prepare Your Code

**Ensure `package.json` has production scripts:**

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "worker": "node dist/worker.js"
  }
}
```

### 2. Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

### 3. Add PostgreSQL

1. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automatically creates:
   - Database
   - Connection URL
   - Credentials

3. **Copy the `DATABASE_URL`** (you'll need it)

### 4. Add Redis

1. Click **"+ New"** → **"Database"** → **"Add Redis"**
2. **Copy the `REDIS_URL`**

### 5. Deploy Your App

**Option A: GitHub Integration (Recommended)**

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Railway auto-detects and deploys

**Option B: Railway CLI**

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
cd ingestion-platform
railway init

# Deploy
railway up
```

### 6. Configure Environment Variables

In Railway dashboard, go to your service → **Variables** tab:

**Required Variables:**
```bash
DATABASE_URL=postgresql://... (from Railway Postgres)
REDIS_URL=redis://... (from Railway Redis)
PORT=3000
NODE_ENV=production
APP_BASE_URL=https://your-app.railway.app

# S3 Storage (use Railway's or external)
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=content-bucket
S3_PUBLIC_BASE_URL=https://your-s3-public-url.com
S3_REGION=us-east-1

# LLM (if using)
GOOGLE_API_KEY=your-gemini-key
# OR
OPENAI_API_KEY=sk-...
# OR
MISTRAL_API_KEY=...

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Optional
ENABLE_SCHEDULER=true
FIRECRAWL_API_KEY=... (if using)
SERPAPI_KEY=... (if using)
```

### 7. Run Database Migrations

```bash
# In Railway dashboard, open service shell, or:
railway run npx prisma migrate deploy
```

### 8. Deploy Worker (Background Process)

1. Create **new service** in Railway
2. Same repo, same directory
3. **Start Command:** `node dist/worker.js`
4. Same environment variables

### 9. Set Up Custom Domain (Optional)

1. In Railway service → **Settings** → **Domains**
2. Add custom domain: `api.whatsay.app`
3. Railway provides SSL automatically

### 10. Update Frontend API URL

**File:** `api/apiIngestion.ts`

```typescript
export const getIngestionApiBase = () => {
  if (__DEV__) {
    return 'http://192.168.0.101:3000'; // Local dev
  }
  return 'https://api.whatsay.app'; // Production - update with your Railway URL
};
```

---

## 🗄️ Database Setup

### Run Migrations

**In Production:**

```bash
# Using Railway CLI
railway run npx prisma migrate deploy

# Or in service shell
npx prisma migrate deploy
```

**Important:** Use `migrate deploy` (not `migrate dev`) in production!

### Verify Database

```bash
# Connect to production DB
railway run npx prisma studio
# Opens browser to view database
```

---

## 🔄 Worker Deployment

The worker processes background jobs (ingestion, rewriting, etc.).

### Railway: Separate Service

1. Create **new service** in Railway
2. Same GitHub repo
3. **Start Command:** `node dist/worker.js`
4. Same environment variables as API

### Process Manager (PM2) - Alternative

If using VPS/Droplet:

```bash
# Install PM2
npm install -g pm2

# Start API
pm2 start dist/index.js --name "api"

# Start Worker
pm2 start dist/worker.js --name "worker"

# Save PM2 config
pm2 save
pm2 startup
```

---

## 📦 S3 Storage Setup

### Option 1: Railway Storage (Simplest)

Railway provides storage, but for production, use external S3.

### Option 2: DigitalOcean Spaces

1. Create Space in DigitalOcean
2. Get endpoint: `https://your-space.nyc3.digitaloceanspaces.com`
3. Get access keys
4. Set in environment:
   ```
   S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
   S3_ACCESS_KEY=your-key
   S3_SECRET_KEY=your-secret
   S3_BUCKET=your-space-name
   S3_PUBLIC_BASE_URL=https://your-space.nyc3.cdn.digitaloceanspaces.com
   ```

### Option 3: AWS S3

1. Create S3 bucket
2. Get credentials
3. Set environment variables

### Option 4: Cloudflare R2 (Cheapest)

1. Create R2 bucket
2. Get endpoint and keys
3. Set environment variables

---

## 🔒 Security Checklist

### Before Going Live

- [ ] **Change default passwords** (if any)
- [ ] **Use strong database passwords**
- [ ] **Enable SSL/HTTPS** (Railway/Render auto-provide)
- [ ] **Set CORS properly:**
   ```typescript
   // In src/index.ts
   await app.register(fastifyCors, {
     origin: [
       'https://whatsay.app', // Your app domain
       'https://*.expo.dev',   // Expo domains
     ],
     credentials: true,
   });
   ```
- [ ] **Don't commit `.env` files**
- [ ] **Use environment variables for secrets**
- [ ] **Enable rate limiting** (optional)
- [ ] **Set up monitoring** (Railway/Render provide)

---

## 🧪 Testing Production Deployment

### 1. Test API Endpoints

```bash
# Test sources endpoint
curl https://api.whatsay.app/api/sources

# Test feed endpoint
curl https://api.whatsay.app/api/feed?limit=5

# Test job trigger
curl -X POST https://api.whatsay.app/api/jobs/run \
  -H "Content-Type: application/json" \
  -d '{"sourceId": "inshorts", "category": "technology"}'
```

### 2. Test from Mobile App

1. Update `api/apiIngestion.ts` with production URL
2. Build app with production API URL
3. Test all features:
   - Fetching categories
   - Loading articles
   - Authentication
   - Comments

### 3. Monitor Logs

**Railway:**
- Dashboard → Service → Logs

**Render:**
- Dashboard → Service → Logs

---

## 📊 Monitoring & Maintenance

### Health Checks

Railway/Render automatically monitor your service. For custom:

```typescript
// Add health check endpoint
app.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});
```

### Logs

- **Railway:** Dashboard → Logs (real-time)
- **Render:** Dashboard → Logs
- **PM2:** `pm2 logs`

### Database Backups

**Railway:** Automatic daily backups  
**Render:** Manual backups available  
**DigitalOcean:** Automated backups (paid)

---

## 🚀 Quick Start: Railway (5 Minutes)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Create project
cd ingestion-platform
railway init

# 4. Add PostgreSQL
# (In Railway dashboard: + New → Database → PostgreSQL)

# 5. Add Redis
# (In Railway dashboard: + New → Database → Redis)

# 6. Set environment variables
# (In Railway dashboard: Variables tab)

# 7. Deploy
railway up

# 8. Run migrations
railway run npx prisma migrate deploy

# 9. Get your URL
railway domain
```

**Done!** Your backend is live at `https://your-app.railway.app`

---

## 💰 Cost Comparison

| Provider | Database | Redis | Storage | App Hosting | **Total/Month** |
|----------|----------|-------|---------|-------------|-----------------|
| **Railway** | $5 | $5 | $5 | $5 | **~$20** |
| **Render** | Free→$7 | Free | $5 | Free→$7 | **Free→$19** |
| **DigitalOcean** | $15 | $15 | $5 | $12 | **~$47** |
| **AWS** | $15+ | $15+ | $5+ | $20+ | **~$55+** |

**Recommendation:** Start with **Railway** or **Render** (free tier), scale up as needed.

---

## ✅ Pre-Deployment Checklist

### Code
- [ ] All environment variables documented
- [ ] Production API URL updated in frontend
- [ ] CORS configured for production domains
- [ ] Error handling in place
- [ ] Logging configured

### Infrastructure
- [ ] PostgreSQL database created
- [ ] Redis instance created
- [ ] S3/storage configured
- [ ] Environment variables set
- [ ] Database migrations run

### Security
- [ ] Strong passwords set
- [ ] SSL/HTTPS enabled
- [ ] CORS restricted to app domains
- [ ] API keys secured (not in code)
- [ ] Firebase Admin SDK configured

### Testing
- [ ] API endpoints tested
- [ ] Database connections working
- [ ] Worker processing jobs
- [ ] Storage uploads working
- [ ] Frontend connects successfully

---

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Test connection
railway run npx prisma db pull

# Check migrations
railway run npx prisma migrate status
```

### Worker Not Processing

- Check worker service is running
- Check Redis connection
- Check logs for errors

### API Not Responding

- Check service is running
- Check PORT environment variable
- Check logs for errors
- Verify domain/URL is correct

---

## 📚 Next Steps

1. **Deploy backend** (follow guide above)
2. **Update frontend** API URL to production
3. **Test thoroughly** with production backend
4. **Build production app** (see PRODUCTION_DEPLOYMENT_GUIDE.md)
5. **Submit to Play Store**

---

## 🎯 Recommended Path

**For First Deployment:**

1. **Use Railway** (easiest, good free tier)
2. **Start with free tier** (test everything)
3. **Scale up** as needed (when you have users)
4. **Monitor costs** (Railway shows usage)

**Quick Start Time:** ~15-30 minutes

---

## 📞 Need Help?

If you need help with:
- Setting up Railway/Render
- Configuring databases
- Deploying code
- Environment variables
- Troubleshooting

**Just ask!** I can guide you through any step. 🚀
