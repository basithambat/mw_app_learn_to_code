# ⚡ Quick Status Check

## Run These Commands to Check API Status

### Option 1: Check if API exists and get URL

```bash
gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(status.url)"
```

**If you see a URL (starts with https://), deployment is complete!** ✅

### Option 2: List all services

```bash
gcloud run services list \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

**Look for `whatsay-api` in the list.**

### Option 3: Check build status

```bash
gcloud builds list \
  --limit=5 \
  --project gen-lang-client-0803362165 \
  --format="table(id,status,createTime)"
```

**Look for latest build - status should be "SUCCESS" when done.**

---

## What to Look For

✅ **Deployment Complete:**
- Service exists with a URL
- Status shows "Ready" or "True"
- Build status is "SUCCESS"

⏳ **Still Deploying:**
- Service doesn't exist yet
- Build status is "WORKING" or "QUEUED"
- No URL available

---

## Once You See the URL

Test it:
```bash
# Replace with your actual URL
curl https://whatsay-api-XXXXX-as.a.run.app/health
```

**Expected response:** `{"status":"healthy","timestamp":"..."}`

---

**Run the commands above and let me know what you see!** 🔍
