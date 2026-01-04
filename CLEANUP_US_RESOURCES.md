# 🗑️ Cleanup US Resources - Avoid Double Charges

## ⚠️ Important: Double Charges

**YES, keeping resources in both regions WILL cause double charges:**

| Resource | US (us-central1) | Mumbai (asia-south1) | Total Cost |
|----------|------------------|----------------------|------------|
| Cloud SQL | ~$0-7/month | ~$0-7/month | **~$0-14/month** |
| Redis | ~$35.77/month | ~$35.77/month | **~$71.54/month** |
| Storage | ~$0.20/month | ~$0.20/month | ~$0.40/month |
| **TOTAL** | **~$36/month** | **~$36/month** | **~$72/month** |

**You'll pay DOUBLE if you keep both!** 💰

---

## ✅ Safe Cleanup Plan

### Option 1: Delete US Resources First (Recommended if No Data)

**Best if:** You haven't deployed yet or have no important data

```bash
PROJECT_ID="gen-lang-client-0803362165"

# 1. Delete Redis in US
echo "Deleting Redis in us-central1..."
gcloud redis instances delete whatsay-redis \
  --region us-central1 \
  --project $PROJECT_ID \
  --quiet

# 2. Delete Cloud SQL in US
# ⚠️ WARNING: This deletes ALL data!
echo "Deleting Cloud SQL in us-central1..."
gcloud sql instances delete whatsay-db \
  --project $PROJECT_ID \
  --quiet

# 3. Delete Storage bucket in US (if exists)
echo "Deleting storage bucket..."
gsutil rm -r gs://whatsay-content 2>/dev/null || echo "Bucket already deleted or doesn't exist"

echo "✅ US resources deleted. Now run ./setup-gcp-india.sh"
```

**Then run:**
```bash
./setup-gcp-india.sh
```

---

### Option 2: Create Mumbai First, Then Delete US (Safer)

**Best if:** You want to verify Mumbai setup works first

```bash
# Step 1: Create Mumbai resources
./setup-gcp-india.sh

# Step 2: Verify Mumbai resources work
gcloud sql instances describe whatsay-db \
  --project gen-lang-client-0803362165 \
  --format="value(name,region,state)"

gcloud redis instances describe whatsay-redis \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(name,state)"

# Step 3: If everything looks good, delete US resources
./cleanup-us-resources.sh
```

---

## 🗑️ Cleanup Script

Create `cleanup-us-resources.sh`:

```bash
#!/bin/bash

PROJECT_ID="gen-lang-client-0803362165"

echo "🗑️  Cleaning up US resources (us-central1)..."
echo "⚠️  This will DELETE all resources in us-central1"
echo ""

read -p "Are you sure? Type 'DELETE' to confirm: " confirm
if [ "$confirm" != "DELETE" ]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Deleting Redis in us-central1..."
gcloud redis instances delete whatsay-redis \
  --region us-central1 \
  --project $PROJECT_ID \
  --quiet 2>&1 || echo "Redis already deleted or doesn't exist"

echo ""
echo "Deleting Cloud SQL in us-central1..."
echo "⚠️  WARNING: This deletes ALL database data!"
gcloud sql instances delete whatsay-db \
  --project $PROJECT_ID \
  --quiet 2>&1 || echo "Cloud SQL already deleted or doesn't exist"

echo ""
echo "Checking storage bucket location..."
BUCKET_LOCATION=$(gsutil ls -L -b gs://whatsay-content 2>/dev/null | grep "Location constraint" | awk '{print $3}' || echo "")
if [ "$BUCKET_LOCATION" = "US" ] || [ "$BUCKET_LOCATION" = "us-central1" ]; then
    echo "Deleting storage bucket in US..."
    gsutil rm -r gs://whatsay-content 2>/dev/null || echo "Bucket already deleted"
else
    echo "Bucket is in $BUCKET_LOCATION, keeping it"
fi

echo ""
echo "✅ Cleanup complete!"
echo "💰 You're no longer being charged for US resources"
```

Make it executable:
```bash
chmod +x cleanup-us-resources.sh
```

---

## 📊 Cost Savings

**Before cleanup:**
- US resources: ~$36/month
- Mumbai resources: ~$36/month
- **Total: ~$72/month** ❌

**After cleanup:**
- Mumbai resources only: ~$36/month
- **Total: ~$36/month** ✅

**Savings: ~$36/month** ($432/year)

---

## ⚠️ Important Notes

1. **Cloud SQL deletion is PERMANENT** - all data is lost
2. **Redis deletion is PERMANENT** - all cached data is lost
3. **Storage bucket** - if you have files, download them first
4. **Secrets** - these are region-agnostic, no need to delete

---

## ✅ Recommended Approach

**For your situation (no production data yet):**

1. **Delete US resources first** (saves money immediately)
2. **Then create Mumbai resources** (clean slate)
3. **Deploy to Mumbai**

```bash
# Quick cleanup
gcloud redis instances delete whatsay-redis --region us-central1 --project gen-lang-client-0803362165 --quiet
gcloud sql instances delete whatsay-db --project gen-lang-client-0803362165 --quiet
gsutil rm -r gs://whatsay-content 2>/dev/null || true

# Then create Mumbai resources
./setup-gcp-india.sh
```

---

**Bottom line:** Delete US resources to avoid double charges! 💰
