# 📱 Building Standalone Native APK

## 🔍 Issue

**Problem:** APK opens as Expo dev launcher
**Cause:** Built with `expo-dev-client` included
**Solution:** Use EAS build with production profile (excludes dev client)

---

## ✅ Best Solution: EAS Build

**EAS build automatically:**
- ✅ Excludes dev client for production
- ✅ Bundles JavaScript into app
- ✅ Creates standalone native app
- ✅ No Metro needed

---

## 🚀 Build Standalone APK

**If you have EAS login:**
```bash
eas build --platform android --profile androidapk
```

**Or production AAB:**
```bash
eas build --platform android --profile production
```

---

## 🔧 Alternative: Fix Local Build

**To exclude dev client locally:**
1. Remove `expo-dev-client` from dependencies (temporarily)
2. Rebuild APK
3. Re-add if needed for development

**This is complex and not recommended.**

---

## 📱 Quick Fix: Use Current APK with Metro

**For now, you can:**
1. Keep Metro running: `exp://192.168.0.103:8081`
2. Open app (shows Expo launcher)
3. Connect to Metro
4. App works normally

---

## ✅ Recommended: EAS Build

**EAS build is the proper way:**
- ✅ Handles dev client exclusion automatically
- ✅ Creates true standalone app
- ✅ Production-ready
- ✅ 10-15 minutes

**Command:**
```bash
eas login  # If not logged in
eas build --platform android --profile androidapk
```

---

**For standalone native app, use EAS build!** 🚀
