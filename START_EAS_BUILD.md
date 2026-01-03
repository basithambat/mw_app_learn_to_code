# 🚀 Start EAS Build - Step by Step

## ⚠️ Login Required

**EAS Build requires you to login first.**

---

## 📋 Steps to Build

### Step 1: Login to Expo/EAS

**In your terminal, run:**
```bash
eas login
```

**What happens:**
- Prompts for email/username
- Prompts for password
- Creates account if you don't have one (free)
- Links your project

---

### Step 2: Start Build

**After logging in, run:**
```bash
eas build --platform android --profile androidapk
```

**What you'll see:**
```
✔ Logged in as: your-email@example.com
✔ Linked to project: @your-account/whatsay

📦 Uploading to EAS Build...
  ████████████████████ 100%

🔨 Starting build...
  Platform: android
  Profile: androidapk
  
⏳ Build in progress...
  Status: in-progress
  Estimated time: 15-20 minutes
  
✅ Build finished!
  Download: https://expo.dev/artifacts/...
  QR Code: [QR code for download]
```

---

## ⏱️ Build Timeline

1. **Upload** (2-5 min): Code uploads to Expo
2. **Build** (15-30 min): Expo builds in cloud
3. **Complete**: Get download link

**Total: ~20-35 minutes**

---

## 📊 Monitor Build

### In Terminal:
The build command shows real-time progress.

### Check Status:
```bash
eas build:list --limit 1
```

### Online Dashboard:
- Go to: https://expo.dev
- Login to your account
- Navigate to: Projects → whatsay → Builds
- See real-time progress and logs

---

## 📱 After Build Completes

**You'll receive:**
- ✅ Download link for APK
- ✅ QR code to download on device
- ✅ Build details

**To install:**
1. Download APK from link
2. Transfer to Android device (email, cloud, USB)
3. Install APK on device
4. Launch app

---

## 🎯 Quick Start

**Run these commands in your terminal:**

```bash
# 1. Login (interactive - enter credentials)
eas login

# 2. Start build (shows progress)
eas build --platform android --profile androidapk
```

**The terminal will show all progress in real-time!**

---

## 💡 Why EAS Build?

- ✅ No local Android SDK needed
- ✅ No Gradle configuration issues
- ✅ Builds in cloud (reliable)
- ✅ Get APK download link
- ✅ Can install on any device

---

**Login first, then build will start!** 🔐
