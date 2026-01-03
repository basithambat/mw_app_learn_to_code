# 🔑 Firebase SHA-1 Setup - Step by Step

## ✅ Your SHA-1 Fingerprint (Debug)

```
64:F5:AD:AF:34:5C:96:FD:55:AC:05:EA:D8:12:61:AF:E1:13:E1:69
```

---

## 📋 Steps to Add SHA-1 to Firebase

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **`whatsay-app-c3627`**

### Step 2: Go to Project Settings
1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**

### Step 3: Find Your Android App
1. Scroll down to **"Your apps"** section
2. Find your **Android app** (`com.safwanambat.whatsay`)
3. If you don't see it, click **"Add app"** → **Android** → Enter package name: `com.safwanambat.whatsay`

### Step 4: Add SHA-1 Fingerprint
1. In your Android app section, find **"SHA certificate fingerprints"**
2. Click **"Add fingerprint"**
3. Paste this SHA-1:
   ```
   64:F5:AD:AF:34:5C:96:FD:55:AC:05:EA:D8:12:61:AF:E1:13:E1:69
   ```
4. Click **"Save"**

### Step 5: Enable Google Sign-in
1. Go to **Authentication** → **Sign-in method**
2. Click on **"Google"**
3. Toggle **"Enable"** to ON
4. Click **"Save"**

### Step 6: Download google-services.json
1. Go back to **Project Settings**
2. Scroll to **"Your apps"** → **Android app**
3. Click **"Download google-services.json"**
4. Save the file

### Step 7: Place File in Project
1. Copy `google-services.json` to:
   ```
   /Users/basith/Documents/whatsay-app-main/android/app/google-services.json
   ```

---

## 🚀 After You Provide the File

**Once you place `google-services.json` in the project, I'll:**

1. ✅ Enable Google Services plugin
2. ✅ Add Firebase initialization to Android
3. ✅ Rebuild the app
4. ✅ Test Firebase Auth

---

## 📝 Quick Copy

**SHA-1 Fingerprint:**
```
64:F5:AD:AF:34:5C:96:FD:55:AC:05:EA:D8:12:61:AF:E1:13:E1:69
```

**Package Name:**
```
com.safwanambat.whatsay
```

**File Location:**
```
android/app/google-services.json
```

---

**Ready when you are!** Just add the SHA-1 to Firebase and download the file. 🚀
