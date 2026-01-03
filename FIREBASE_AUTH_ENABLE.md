# 🔥 Enable Firebase Authentication Providers

## 🔍 Issues Found

1. **Phone Sign-in Error:** `[auth/operation-not-allowed]`
   - Phone authentication is **disabled** in Firebase Console

2. **Google Sign-in Error:** `DEVELOPER_ERROR`
   - Google Sign-in configuration issue (likely SHA-1 or OAuth client)

---

## ✅ Fix: Enable Authentication Providers

### Step 1: Enable Phone Authentication

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select project: **`whatsaynews`**

2. **Enable Phone Sign-in:**
   - Click **"Authentication"** in left sidebar
   - Click **"Sign-in method"** tab
   - Find **"Phone"** in the list
   - Click on **"Phone"**
   - Toggle **"Enable"** to **ON**
   - Click **"Save"**

---

### Step 2: Fix Google Sign-in (DEVELOPER_ERROR)

**The error suggests Google Sign-in needs proper configuration.**

**Check:**
1. **SHA-1 fingerprint is added** (we already did this ✅)
2. **OAuth client is configured** correctly

**In Firebase Console:**
1. Go to **Project Settings** → **Your apps** → **Android app**
2. Verify **SHA-1 fingerprint** is present:
   - `64:F5:AD:AF:34:5C:96:FD:55:AC:05:EA:D8:12:61:AF:E1:13:E1:69`
3. **Download updated `google-services.json`** (if SHA-1 was just added)
4. Replace the file in `android/app/google-services.json`

**For Google Sign-in:**
1. Go to **Authentication** → **Sign-in method**
2. Click **"Google"**
3. Make sure **"Enable"** is **ON**
4. Verify **Web client ID** matches your code:
   - Current in code: `396092481898-m1b6htvg05uokocbhr9i4t0k7o1tipf4.apps.googleusercontent.com`
5. Click **"Save"**

---

## 🚀 Quick Steps Summary

**In Firebase Console (`whatsaynews` project):**

1. **Authentication** → **Sign-in method** → **Phone** → **Enable** → **Save**
2. **Authentication** → **Sign-in method** → **Google** → **Enable** → **Save**
3. **Project Settings** → **Your apps** → **Android** → Verify SHA-1 → Download `google-services.json` (if updated)
4. Replace `google-services.json` in project

---

## ✅ After Enabling

**Reload the app:**
- Phone sign-in should work
- Google sign-in should work
- No more `operation-not-allowed` errors

---

**Enable both providers in Firebase Console and the errors will be fixed!** 🚀
