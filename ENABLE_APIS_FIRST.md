# ⚠️ Enable These APIs First (One-Time Setup)

## Quick Steps

The service account is authenticated, but these APIs need to be enabled manually first (one-time setup).

### Option 1: Enable All at Once (Easiest)

**Go to this link and click "Enable":**
```
https://console.cloud.google.com/apis/library?project=gen-lang-client-0803362165
```

Then search for and enable each API below, OR use the direct links:

### Option 2: Direct Links (Click Each)

1. **Service Usage API** (Required first!)
   ```
   https://console.developers.google.com/apis/api/serviceusage.googleapis.com/overview?project=278662370606
   ```

2. **Cloud Resource Manager API**
   ```
   https://console.developers.google.com/apis/api/cloudresourcemanager.googleapis.com/overview?project=278662370606
   ```

3. **Cloud SQL Admin API**
   ```
   https://console.developers.google.com/apis/api/sqladmin.googleapis.com/overview?project=278662370606
   ```

4. **Memorystore for Redis API**
   ```
   https://console.developers.google.com/apis/api/redis.googleapis.com/overview?project=278662370606
   ```

5. **Cloud Run API**
   ```
   https://console.developers.google.com/apis/api/run.googleapis.com/overview?project=278662370606
   ```

6. **Cloud Build API**
   ```
   https://console.developers.google.com/apis/api/cloudbuild.googleapis.com/overview?project=278662370606
   ```

7. **Secret Manager API**
   ```
   https://console.developers.google.com/apis/api/secretmanager.googleapis.com/overview?project=278662370606
   ```

8. **Cloud Storage API**
   ```
   https://console.developers.google.com/apis/api/storage-component.googleapis.com/overview?project=278662370606
   ```

9. **Compute Engine API**
   ```
   https://console.developers.google.com/apis/api/compute.googleapis.com/overview?project=278662370606
   ```

10. **Serverless VPC Access API**
    ```
    https://console.developers.google.com/apis/api/vpcaccess.googleapis.com/overview?project=278662370606
    ```

---

## ✅ After Enabling APIs

Once you've enabled the APIs above (especially Service Usage API), come back and I'll run:

```bash
./setup-gcp-with-project.sh gen-lang-client-0803362165
```

And the setup will complete automatically!

---

## 🚀 Quick Enable (If You Have Console Access)

1. Go to: https://console.cloud.google.com/apis/library?project=gen-lang-client-0803362165
2. Search for each API name above
3. Click "Enable" for each one
4. Wait 1-2 minutes for propagation
5. Let me know when done, and I'll continue!

---

**Time:** ~2-3 minutes to enable all APIs, then I can run the full setup automatically! 🎯
