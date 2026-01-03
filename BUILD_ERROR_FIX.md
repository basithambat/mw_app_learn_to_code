# ⚠️ Build Error - Android SDK Not Found

## ❌ Error

```
SDK location not found. Define a valid SDK location with an ANDROID_HOME 
environment variable or by setting the sdk.dir path in your project's 
local properties file.
```

---

## 🔧 Solution

### Option 1: Install Android Studio (Recommended)

1. **Download Android Studio:**
   - https://developer.android.com/studio
   - Install it

2. **Android SDK will be installed automatically** at:
   ```
   ~/Library/Android/sdk
   ```

3. **Then build again:**
   ```bash
   npx expo run:android
   ```

---

### Option 2: Set ANDROID_HOME (If SDK exists)

**If you have Android SDK installed elsewhere:**

```bash
# Find your SDK location
find ~ -name "android.jar" 2>/dev/null | head -1

# Set ANDROID_HOME
export ANDROID_HOME=/path/to/android/sdk

# Add to local.properties
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

---

### Option 3: Use EAS Build (No Local SDK Needed)

**Build in the cloud instead:**

```bash
# 1. Login
eas login

# 2. Build
eas build --platform android --profile androidapk
```

**This doesn't require Android Studio or SDK!**

---

## 🎯 Recommended: Use EAS Build

Since Android SDK is not installed, **EAS Build is the fastest option**:

```bash
# 1. Login to Expo
eas login

# 2. Build in cloud
eas build --platform android --profile androidapk
```

**Benefits:**
- ✅ No Android Studio needed
- ✅ No SDK installation needed
- ✅ Builds in cloud (15-30 minutes)
- ✅ Get APK download link

---

## 📱 Alternative: Install Android Studio

If you want to build locally:

1. **Install Android Studio** (large download ~1GB)
2. **Open Android Studio** → SDK Manager
3. **Install Android SDK**
4. **Then build:**
   ```bash
   npx expo run:android
   ```

---

**EAS Build is the quickest solution!** ☁️
