# 🎮 Play Store Deployment Checklist

**App:** WhatSay  
**Version:** 3.2 (versionCode: 14)  
**Package:** `com.safwanambat.whatsay`  
**Last Updated:** January 15, 2026

---

## ✅ Phase 1: Already Complete

- [x] Backend API deployed (`https://whatsay-api-jsewdobsva-el.a.run.app`)
- [x] Production AAB built (`whatsay-v3.3-final-no-camera.aab`)
- [x] Package name: `com.safwanambat.whatsay`
- [x] Version: 3.2 / versionCode: 14
- [x] Firebase configured
- [x] Privacy policy created (`PRIVACY_POLICY.md`)

---

## 🔲 Phase 2: Pre-Submission Requirements

### Privacy Policy
- [ ] **Host privacy policy at public URL**
  - Options: GitHub Pages, Notion public page, Google Sites, your website
  - URL: `________________`
- [ ] Update email in `PRIVACY_POLICY.md` (replace `[Your Email Address]`)

### Test Production Build
- [ ] Install AAB/APK on physical device
- [ ] Verify all features work
- [ ] Confirm no crashes
- [ ] Test on different Android versions if possible

---

## 🔲 Phase 3: Google Play Console Account

### Create Account (if not done)
1. Go to: https://play.google.com/console
2. Sign in with Google account
3. Pay **$25** one-time fee
4. Complete identity verification (1-2 days)

- [ ] Play Console account active
- [ ] Identity verification complete

---

## 🔲 Phase 4: Create App in Play Console

1. Click **"Create app"**
2. Fill in:
   - **App name:** WhatSay
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
3. Accept declarations
4. Click **Create**

- [ ] App created in Play Console

---

## 🔲 Phase 5: Store Listing

### Main Store Listing
| Field | Limit | Content |
|-------|-------|---------|
| App name | 30 chars | WhatSay |
| Short description | 80 chars | `________________` |
| Full description | 4000 chars | `________________` |

### Suggested Short Description
```
AI-powered news with Reddit-style comments. Stay informed, join discussions.
```

### Graphics Assets

| Asset | Size | Status |
|-------|------|--------|
| App icon | 512x512 PNG | [ ] |
| Feature graphic | 1024x500 PNG | [ ] |
| Phone screenshots | 320-3840px wide, 16:9 or 9:16 | [ ] Min 2, Max 8 |
| Tablet screenshots | (optional) | [ ] |
| Promo video | YouTube URL (optional) | [ ] |

### Categories
- [ ] **Category:** News & Magazines
- [ ] **Tags:** Select up to 5 relevant tags

### Contact Details
- [ ] Email: `________________`
- [ ] Phone (optional): `________________`
- [ ] Website (optional): `________________`

---

## 🔲 Phase 6: Content Rating

1. Go to **Policy** → **App content** → **Content rating**
2. Start new questionnaire
3. Answer questions about:
   - Violence
   - Sexual content
   - Language
   - Controlled substances
   - User-generated content

- [ ] Questionnaire completed
- [ ] Rating received (expected: **Everyone** or **Teen**)

---

## 🔲 Phase 7: Data Safety

### Required Disclosures
Navigate to **Policy** → **App content** → **Data safety**

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email | Yes | No | Account management |
| Name | Yes | No | Profile |
| Location | Yes (optional) | No | Personalization |
| Photos | Yes (profile) | No | Profile picture |
| App interactions | Yes | No | Analytics |
| Crash logs | Yes | No | App stability |

- [ ] Data collection disclosed
- [ ] Data sharing disclosed
- [ ] Security practices described
- [ ] Privacy policy URL added
- [ ] Data deletion info provided

---

## 🔲 Phase 8: App Access

If app requires login to access core features:
- [ ] Provide demo credentials for Google reviewer
  - Email: `________________`
  - Password: `________________`

Or:
- [ ] Confirm no login required to view news feed

---

## 🔲 Phase 9: Target Audience

1. Go to **Policy** → **App content** → **Target audience**
2. Select age groups your app targets

- [ ] Target audience declaration complete
- [ ] Confirm app is NOT primarily for children (under 13)

---

## 🔲 Phase 10: Upload AAB

### Create Release
1. Go to **Release** → **Production** (or start with **Internal testing**)
2. Click **"Create new release"**
3. Upload your AAB file

```bash
# Your AAB is located at:
/Users/basith/Documents/whatsay-app-main/whatsay-v3.3-final-no-camera.aab
```

- [ ] AAB uploaded
- [ ] Release name added (e.g., "v3.2")
- [ ] Release notes written

### Recommended: Start with Internal Testing
1. Create **Internal testing** track first
2. Add tester emails
3. Test before production release

- [ ] Internal testing track created
- [ ] Testers added and invited
- [ ] Internal testing verified

---

## 🔲 Phase 11: Review & Publish

### Pre-Submission Checklist
- [ ] All store listing fields complete
- [ ] All required graphics uploaded
- [ ] Content rating complete
- [ ] Data safety complete
- [ ] Target audience set
- [ ] Privacy policy URL accessible
- [ ] AAB uploaded

### Submit for Review
1. Go to **Publishing overview**
2. Click **"Send X changes for review"**
3. Confirm submission

- [ ] App submitted for review

---

## 📅 Timeline

| Stage | Duration |
|-------|----------|
| Account verification | 1-2 days |
| First review | 3-7 days |
| Subsequent updates | 1-3 days |

---

## ⚠️ Common Rejection Reasons

1. **Missing privacy policy** - Ensure URL is accessible
2. **Data safety mismatch** - Disclosures must match actual collection
3. **Incomplete metadata** - All required fields must be filled
4. **App crashes** - Test thoroughly before submission
5. **Content policy violation** - Review Google's policies

---

## 🚀 Quick Start Commands

```bash
# Build new AAB if needed
eas build --platform android --profile production

# Or build APK for testing
eas build --platform android --profile androidapk
```

---

## 📋 Summary: Your Next Steps

1. **Host privacy policy** at a public URL
2. **Create/access** Google Play Console account
3. **Create app** in Play Console
4. **Prepare graphics:**
   - 512x512 app icon
   - 1024x500 feature graphic
   - 2-8 phone screenshots
5. **Complete all policy forms** (content rating, data safety, target audience)
6. **Upload AAB** (you already have `whatsay-v3.3-final-no-camera.aab`)
7. **Submit for review**

---

**You have the AAB ready - now it's mostly console setup! 🚀**
