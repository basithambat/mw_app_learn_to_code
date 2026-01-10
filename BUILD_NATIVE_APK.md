# 📱 Build Standalone Native APK (No Expo)

## 🔍 Issue

**Problem:** APK opens as Expo dev launcher
**Cause:** Built with `expo-dev-client` included
**Solution:** Use EAS build (excludes dev client automatically)

---

## ✅ Solution: EAS Build

**EAS build automatically:**
- ✅ Excludes dev client for production
- ✅ Creates standalone native app
- ✅ No Metro needed
- ✅ Opens as regular app

---

## 🚀 Build Standalone APK

### Step 1: Login to EAS
```bash
eas login
```
(Opens browser or prompts for credentials)

### Step 2: Build Standalone APK
```bash
eas build --platform android --profile androidapk
```

**This will:**
- Build in cloud (10-15 minutes)
- Exclude dev client automatically
- Create standalone APK
- Provide download link

---

## ⏱️ Timeline

**Login:** 1 minute
**Build:** 10-15 minutes
**Download & Install:** 2 minutes
**Total:** 12-17 minutes

---

## 📱 What You'll Get

- ✅ Standalone APK (no Expo)
- ✅ Opens as native app
- ✅ Production API configured
- ✅ All features working

---

## 🔧 Alternative: Keep Current APK

**If you want to use current APK:**
- Keep Metro running: `exp://192.168.0.103:8081`
- Open app → Connect to Metro
- App works normally

---

**For standalone native app, use EAS build!** 🚀

**Command:**
```bash
eas login
eas build --platform android --profile androidapk
```
