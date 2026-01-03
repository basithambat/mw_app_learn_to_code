# 🏗️ Start Build - Quick Guide

## ⚠️ Important Note

**`npx expo build` is deprecated!** Use one of these instead:

---

## 🎯 Option 1: Local Development Build (Recommended)

Builds and installs directly on your connected device:

### For Android:
```bash
npm run android
```

### For iOS:
```bash
npm run ios
```

**What happens:**
1. Builds the app locally
2. Installs on your connected device
3. Launches automatically

**Requirements:**
- Android: Android Studio installed
- iOS: Xcode installed
- Device connected via USB

---

## ☁️ Option 2: EAS Cloud Build (For Production)

Builds in Expo's cloud (no local tools needed):

### Step 1: Login to EAS
```bash
eas login
```

### Step 2: Build
```bash
# Android APK
eas build --platform android --profile androidapk

# Android AAB (for Play Store)
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

**What happens:**
1. Uploads code to Expo cloud
2. Builds in the cloud
3. Provides download link when done

---

## 📋 Quick Decision

**Use Local Build if:**
- ✅ You have Android Studio / Xcode
- ✅ Device is connected via USB
- ✅ You want to test quickly

**Use EAS Build if:**
- ✅ You don't have Android Studio / Xcode
- ✅ You want a production build
- ✅ You want to distribute the app

---

## 🚀 Most Common: Local Android Build

If you have Android Studio and device connected:

```bash
npm run android
```

This will:
1. Build the APK
2. Install on your phone
3. Launch the app

---

**Choose your build method above!** 🎯
