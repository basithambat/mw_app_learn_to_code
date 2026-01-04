# ⚡ Quick API Enablement - 2 Minutes

## Step 1: Enable Service Usage API (Required First!)

**Click this link and click "Enable":**
```
https://console.developers.google.com/apis/api/serviceusage.googleapis.com/overview?project=278662370606
```

**OR** go to: https://console.cloud.google.com/apis/library/serviceusage.googleapis.com?project=gen-lang-client-0803362165

---

## Step 2: Enable All Other APIs at Once

**Option A: Use the Script (After Step 1)**
```bash
cd /Users/basith/Documents/whatsay-app-main
./enable-apis-quick.sh
```

**Option B: Enable in Console (One Click)**
Go to: https://console.cloud.google.com/apis/library?project=gen-lang-client-0803362165

Search for and enable these (click "Enable" for each):
1. ✅ Cloud SQL Admin API
2. ✅ Memorystore for Redis API  
3. ✅ Cloud Run API
4. ✅ Secret Manager API
5. ✅ Cloud Storage API
6. ✅ Compute Engine API
7. ✅ Serverless VPC Access API
8. ✅ Cloud Build API

---

## Step 3: Run Cost-Optimized Setup

Once APIs are enabled, I'll automatically run:
```bash
./setup-gcp-cost-optimized.sh
```

This will create everything with **cost-optimized settings**:
- ✅ Cloud SQL: **db-f1-micro** (FREE TIER eligible)
- ✅ Redis: **1GB basic** (smallest, ~$30/month)
- ✅ Storage: **Standard tier** (not premium)
- ✅ VPC: **Minimal instances** (1-2 instead of 2-3)
- ✅ **Total: ~$40-60/month** (with free tier: ~$30-40/month)

---

## 🚀 Fastest Path

1. **Enable Service Usage API** (link above) - 30 seconds
2. **Run:** `./enable-apis-quick.sh` - 1 minute
3. **Wait 30 seconds** for propagation
4. **I'll run the setup automatically** - 20-30 minutes

**Total time: ~25-35 minutes**

---

**After you enable Service Usage API, let me know and I'll continue!** 🎯
