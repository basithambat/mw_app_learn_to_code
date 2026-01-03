# 🔑 Getting SHA-1 Fingerprint for Firebase

## 📋 What You Need

**SHA-1 Release Fingerprint** for your Android app to enable Google Sign-in in Firebase.

---

## 🎯 Method 1: Debug Keystore (For Development)

**For development/testing, use debug keystore:**

```bash
# Get SHA-1 from debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Look for:**
```
SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

---

## 🎯 Method 2: Release Keystore (For Production)

**If you have a release keystore:**

```bash
# Replace with your actual keystore path and alias
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

**You'll be prompted for the keystore password.**

---

## 🎯 Method 3: Using Gradle (If Configured)

**If signing is configured in `build.gradle`:**

```bash
cd android
./gradlew signingReport
```

**Look for SHA1 in the output.**

---

## 📱 Steps to Add SHA-1 to Firebase

1. **Get SHA-1 fingerprint** (using one of the methods above)
2. **Go to Firebase Console:**
   - [Firebase Console](https://console.firebase.google.com/)
   - Select project: `whatsay-app-c3627`
   - Go to **Project Settings** (gear icon)
   - Scroll to **"Your apps"** section
   - Click on your **Android app** (`com.safwanambat.whatsay`)
3. **Add SHA-1:**
   - Click **"Add fingerprint"**
   - Paste your SHA-1 fingerprint
   - Click **Save**
4. **Download updated `google-services.json`:**
   - Click **"Download google-services.json"**
   - Save the file
5. **Place in project:**
   - Copy to: `android/app/google-services.json`

---

## 🔍 Quick Check

**Let me get your SHA-1 fingerprint now...**
