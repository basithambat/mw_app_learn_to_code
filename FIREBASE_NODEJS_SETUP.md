# 🔥 Firebase Admin SDK - Node.js Setup

## ✅ You Need: **Node.js** Snippet

**Our backend is built with Node.js/TypeScript**, so we need the **Node.js** snippet from Firebase Console.

---

## 📋 What to Do in Firebase Console

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select project: `whatsay-app-c3627`

2. **Go to Project Settings:**
   - Click gear icon (⚙️) → Project settings
   - Go to **"Service accounts"** tab

3. **Select Node.js:**
   - You'll see tabs: Node.js, Java, Python, Go
   - **Click "Node.js"** tab

4. **Generate New Private Key:**
   - Click **"Generate new private key"** button
   - Click **"Generate key"** in the popup
   - A JSON file will download

5. **Share with Me:**
   - Copy the entire JSON content, OR
   - Share the file path

---

## 🎯 What the JSON Looks Like

```json
{
  "type": "service_account",
  "project_id": "whatsay-app-c3627",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...@whatsay-app-c3627.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## 🚀 What I'll Do With It

Once you share the JSON, I'll:

1. ✅ Add it to backend environment variables
2. ✅ Configure Firebase Admin SDK initialization
3. ✅ Enable token verification
4. ✅ Test backend authentication

---

## 📝 Quick Steps

1. Firebase Console → Project Settings → Service accounts
2. Click **"Node.js"** tab
3. Click **"Generate new private key"**
4. Download JSON file
5. **Share the JSON content with me**

---

**Select Node.js in Firebase Console and share the JSON!** 🚀
