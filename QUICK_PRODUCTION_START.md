# ⚡ Quick Production Start Guide

## 🎯 Fastest Path to Production

### Step 1: Set Up Google Play Console (30 minutes)

1. **Go to:** https://play.google.com/console
2. **Pay $25** one-time registration fee
3. **Create app:**
   - Name: "WhatSay"
   - Free app
   - Complete basic info

**Wait:** 1-2 days for account approval

---

### Step 2: Build Production App (15-30 minutes)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure (creates eas.json)
eas build:configure

# 4. Build production AAB
eas build --platform android --profile production
```

**Result:** Download link for `.aab` file

---

### Step 3: Update Production Config

**File:** `app.json`
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

**File:** `api/apiIngestion.ts`
```typescript
export const getIngestionApiBase = () => {
  if (__DEV__) {
    return 'http://192.168.0.101:3000';
  }
  return 'https://api.whatsay.app'; // Your production API
};
```

---

### Step 4: Upload to Play Console

1. **Download `.aab`** from EAS
2. **Go to Play Console** → Your app
3. **Production** → **Create new release**
4. **Upload `.aab`**
5. **Add release notes**
6. **Submit for review**

---

## 🎯 Alternative: Direct APK (No Play Store)

### Build APK
```bash
eas build --platform android --profile production --local
```

### Distribute
- Host on your website
- Share download link
- Users enable "Install from unknown sources"

---

## ✅ Checklist Before Building

- [ ] Update version in `app.json`
- [ ] Set production API URL
- [ ] Test app thoroughly
- [ ] Backend deployed to production
- [ ] Firebase production configured

---

**Ready to start? Run the commands above!** 🚀
