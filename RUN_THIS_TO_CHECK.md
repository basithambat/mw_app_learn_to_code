# ✅ Run This to Check Deployment

## Quick Check Script

I've created a script that will check the deployment status for you.

**Run this command:**

```bash
cd /Users/basith/Documents/whatsay-app-main
./check-deployment.sh
```

This will:
1. ✅ Check if API is deployed
2. ✅ Show the API URL if ready
3. ✅ Test the health endpoint
4. ✅ Show build status if not ready

---

## Or Run Manually

**Check API URL:**
```bash
gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(status.url)"
```

**List all services:**
```bash
gcloud run services list \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

---

**Please run `./check-deployment.sh` and share the output!** 🔍
