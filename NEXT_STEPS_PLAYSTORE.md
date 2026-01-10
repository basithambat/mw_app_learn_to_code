# 🚀 Next Steps: Play Store Launch

## ✅ What's Complete

1. ✅ **Backend API** - Deployed and working
   - URL: `https://whatsay-api-jsewdobsva-el.a.run.app`
   - Endpoints: `/api/sources` working
   - Region: Mumbai (asia-south1)

2. ✅ **Frontend Configuration** - Updated
   - Production API URL set
   - Environment detection working

3. ✅ **App Version** - Ready
   - Version: 2.8
   - Version Code: 10

---

## 📋 Next Steps (In Order)

### Step 1: Verify API Connection ✅
**Status:** Already working

Test that the app can connect to production API:
```bash
# Test API
curl https://whatsay-api-jsewdobsva-el.a.run.app/api/sources
```

---

### Step 2: Run Database Migrations (Optional)
**Why:** Enables `/api/feed` and `/health` endpoints

```bash
gcloud run jobs execute whatsay-migrate \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

**Note:** `/api/sources` works without migrations. Feed/health need database.

---

### Step 3: Build Production App Bundle (AAB)

#### 3.1 Install EAS CLI (if not installed)
```bash
npm install -g eas-cli
```

#### 3.2 Login to Expo
```bash
eas login
```

#### 3.3 Build Production AAB
```bash
# Build for Play Store (AAB format)
eas build --platform android --profile production

# Or build APK for testing first
eas build --platform android --profile androidapk
```

**Build Time:** ~15-20 minutes

**Output:** 
- AAB file for Play Store
- Download link will be provided

---

### Step 4: Test Production Build

#### 4.1 Download Build
- Get download link from EAS build output
- Or check: https://expo.dev/accounts/[your-account]/builds

#### 4.2 Install on Device
```bash
# For APK
adb install path/to/app.apk

# For AAB (convert to APK for testing, or use internal testing track)
```

#### 4.3 Verify
- ✅ App opens
- ✅ Connects to production API
- ✅ Sources load
- ✅ Feed loads (if migrations run)
- ✅ All features work

---

### Step 5: Google Play Console Setup

#### 5.1 Create Play Console Account
1. Go to: https://play.google.com/console
2. Sign in with Google account
3. Pay one-time fee: **$25** (lifetime)
4. Complete account setup (1-2 days approval)

#### 5.2 Create App
1. Click **"Create app"**
2. Fill details:
   - **App name:** WhatSay
   - **Default language:** English
   - **App or game:** App
   - **Free or paid:** Free
3. Click **"Create"**

---

### Step 6: Prepare Store Listing

#### 6.1 App Details
- **App name:** WhatSay
- **Short description:** (50 chars max)
- **Full description:** (4000 chars max)
- **App icon:** `./assets/images/icon.png`
- **Feature graphic:** (1024x500px)
- **Screenshots:** (at least 2, up to 8)

#### 6.2 Content Rating
- Complete questionnaire
- Get rating (usually Everyone)

#### 6.3 Privacy Policy
- Required for Play Store
- Create privacy policy page
- Add URL to store listing

#### 6.4 Target Audience
- Age groups
- Content guidelines

---

### Step 7: Upload AAB to Play Store

#### 7.1 Create Release
1. Go to: **Production** → **Create new release**
2. Upload AAB file
3. Add release notes
4. Review and roll out

#### 7.2 Internal Testing (Recommended First)
1. Create **Internal testing** track
2. Upload AAB
3. Add testers (up to 100)
4. Test thoroughly

#### 7.3 Production Release
1. After internal testing passes
2. Upload to **Production** track
3. Submit for review

---

### Step 8: App Review Process

**Timeline:** 1-7 days

**What Google Checks:**
- App functionality
- Content policy compliance
- Privacy policy
- Permissions usage
- Security

**Common Issues:**
- Missing privacy policy
- Incorrect permissions
- Content violations

---

## 🎯 Quick Start Commands

```bash
# 1. Build production AAB
eas build --platform android --profile production

# 2. After build completes, download AAB
# 3. Upload to Play Console → Production → Create release
# 4. Submit for review
```

---

## 📝 Pre-Submission Checklist

### App Configuration
- [x] Production API URL set
- [x] App version updated (2.8)
- [x] Version code incremented (10)
- [ ] Test production build on device
- [ ] All features working

### Store Listing
- [ ] App icon (512x512px)
- [ ] Feature graphic (1024x500px)
- [ ] Screenshots (at least 2)
- [ ] Short description
- [ ] Full description
- [ ] Privacy policy URL

### Compliance
- [ ] Content rating completed
- [ ] Privacy policy created
- [ ] Permissions justified
- [ ] Data safety form completed

### Testing
- [ ] Internal testing track created
- [ ] Testers added
- [ ] All features verified
- [ ] No crashes
- [ ] Performance acceptable

---

## ⚠️ Important Notes

1. **API Migrations:** Run migrations before launch if you need feed/health endpoints
2. **Privacy Policy:** Required - create one before submission
3. **Testing:** Always test production build before submitting
4. **Version Code:** Must increment for each release (currently 10)
5. **Build Time:** Allow 15-20 minutes for EAS build

---

## 🚀 Ready to Launch?

**Current Status:**
- ✅ Backend deployed
- ✅ API working
- ✅ Frontend configured
- ✅ App version ready

**Next Action:**
```bash
eas build --platform android --profile production
```

**Then:**
1. Test the build
2. Upload to Play Console
3. Complete store listing
4. Submit for review

---

**You're ready to build and submit!** 🎉
