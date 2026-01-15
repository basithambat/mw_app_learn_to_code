# 🍎 App Store Deployment Checklist

**App:** WhatSay  
**Version:** 3.2 (Build 18)  
**Bundle ID:** `com.safwanambat.whatsay`  
**Last Updated:** January 15, 2026

---

## Phase 1: Pre-Build Requirements

### Backend & API ✅
- [x] Production API deployed (`https://whatsay-api-jsewdobsva-el.a.run.app`)
- [x] All endpoints working (`/api/sources`, `/api/feed`)
- [x] CORS configured for production

### App Configuration ✅
- [x] Bundle identifier set: `com.safwanambat.whatsay`
- [x] Version: `3.2` / Build Number: `18`
- [x] Production API URL configured
- [x] Firebase configured
- [x] Sentry error tracking configured
- [x] `usesNonExemptEncryption: false` (no export compliance needed)

### EAS Configuration ✅
- [x] `eas.json` production profile configured
- [x] Apple ID: `safwanambat@gmail.com`
- [x] App Store Connect App ID: `6737504537`
- [x] Apple Team ID: `HDLYD4QM4F`

---

## Phase 2: Legal & Compliance

### Privacy Policy
- [x] Privacy policy document created (`PRIVACY_POLICY.md`)
- [ ] **Host privacy policy on public URL** (GitHub Pages, website, etc.)
- [ ] Update placeholder email `[Your Email Address]` with real contact
- [ ] Privacy Policy URL: `________________`

### App Store Connect Legal
- [ ] Accept latest Apple Developer Program License Agreement
- [ ] Verify Developer Account is in good standing

---

## Phase 3: Build Production App

### Build iOS App
```bash
# Login to EAS
eas login

# Build production IPA
eas build --platform ios --profile production
```

- [ ] EAS build started
- [ ] Build completed successfully
- [ ] Build URL: `________________`

### Test Production Build
- [ ] Install on physical device via TestFlight or ad-hoc
- [ ] App launches without crashes
- [ ] Login/authentication works
- [ ] News feed loads correctly
- [ ] Images load properly
- [ ] Comments system works
- [ ] All animations smooth (60fps)
- [ ] No console errors in production

---

## Phase 4: App Store Connect Setup

### App Information
- [ ] App Name: **WhatSay**
- [ ] Subtitle (30 chars): `________________`
- [ ] Primary Category: **News**
- [ ] Secondary Category (optional): `________________`
- [ ] Content Rights: Confirm you have rights to content

### Pricing
- [ ] Price: **Free**
- [ ] Availability: All territories (or select specific)

---

## Phase 5: Store Listing Assets

### App Icon
- [ ] 1024x1024px PNG (no alpha/transparency)
- [ ] Location: `./assets/images/icon.png` (may need resize)

### Screenshots (Required)
| Device | Size | Status |
|--------|------|--------|
| iPhone 6.7" (14 Pro Max) | 1290 x 2796 | [ ] |
| iPhone 6.5" (11 Pro Max) | 1242 x 2688 | [ ] |
| iPhone 5.5" (8 Plus) | 1242 x 2208 | [ ] |
| iPad Pro 12.9" | 2048 x 2732 | [ ] (if supporting tablets) |

**Tips:**
- Minimum 2 screenshots per device size
- Maximum 10 screenshots
- Can use single set if aspect ratios match

### App Preview Videos (Optional)
- [ ] 15-30 second video showcasing app
- [ ] Format: H.264, 30fps

### Descriptions
- [ ] **Short Description** (Promotional Text, 170 chars):
  ```
  ________________
  ```
- [ ] **Full Description** (4000 chars max):
  ```
  ________________
  ```
- [ ] **Keywords** (100 chars, comma-separated):
  ```
  news, ai, personalized, reddit, comments, discussion
  ```
- [ ] **What's New** (Release notes):
  ```
  ________________
  ```

### Support Information
- [ ] Support URL: `________________`
- [ ] Marketing URL (optional): `________________`
- [ ] Privacy Policy URL: `________________`

---

## Phase 6: App Privacy (Data Collection)

### Data Types Collected
Complete the App Privacy section in App Store Connect:

| Data Type | Collected | Linked to User | Tracking |
|-----------|-----------|----------------|----------|
| Email Address | Yes | Yes | No |
| Name | Yes | Yes | No |
| Photos | Yes (profile) | Yes | No |
| Location | Yes (optional) | Yes | No |
| Usage Data | Yes | No | No |
| Diagnostics | Yes (Sentry) | No | No |

- [ ] App Privacy questionnaire completed
- [ ] Third-party SDKs disclosed (Firebase, Sentry)

---

## Phase 7: Age Rating & Content

### Content Rating Questionnaire
- [ ] Complete Apple's age rating questionnaire
- [ ] Expected rating: **4+** or **12+** (news content)

### Content Declarations
- [ ] No objectionable content
- [ ] User-generated content moderation (if applicable)
- [ ] No gambling/contests

---

## Phase 8: TestFlight (Internal Testing)

### Internal Testing
```bash
# Submit to TestFlight
eas submit --platform ios
```

- [ ] Build uploaded to App Store Connect
- [ ] Build processing complete
- [ ] Internal testers added
- [ ] Test on multiple devices
- [ ] All critical flows verified
- [ ] No crashes reported in TestFlight

### External TestFlight (Optional)
- [ ] Beta App Review submitted
- [ ] External testers invited
- [ ] Feedback collected

---

## Phase 9: Submit for Review

### Pre-Submission Checklist
- [ ] All metadata complete
- [ ] All screenshots uploaded
- [ ] Privacy Policy URL valid and accessible
- [ ] App tested thoroughly
- [ ] Version/build number correct

### Submission
- [ ] Select build for review
- [ ] Add release notes
- [ ] Answer export compliance (already set to No)
- [ ] Answer content rights questions
- [ ] **Submit for Review**

### Review Information (for Apple Reviewer)
- [ ] Demo account credentials (if login required):
  - Email: `________________`
  - Password: `________________`
- [ ] Contact information for reviewer questions
- [ ] Notes for reviewer (optional)

---

## Phase 10: Post-Submission

### Review Timeline
- First submission: 24-48 hours (can take up to 7 days)
- Updates: Usually faster (24 hours)

### Common Rejection Reasons
- [ ] Missing privacy policy URL
- [ ] App crashes during review
- [ ] Incomplete metadata
- [ ] Login issues without demo account
- [ ] Placeholder content in app

### If Rejected
- [ ] Read rejection reason carefully
- [ ] Fix issues
- [ ] Reply to App Review in Resolution Center
- [ ] Resubmit

### If Approved
- [ ] Choose release option (Manual/Automatic)
- [ ] Monitor crash reports
- [ ] Respond to user reviews

---

## 📱 Quick Commands

```bash
# 1. Build for App Store
eas build --platform ios --profile production

# 2. Submit to App Store Connect
eas submit --platform ios

# 3. Check build status
eas build:list --platform ios
```

---

## 🎮 Parallel: Play Store Checklist

If submitting to Play Store simultaneously:

- [ ] Build AAB: `eas build --platform android --profile production`
- [ ] Create Play Console account ($25 one-time)
- [ ] Complete store listing (similar to above)
- [ ] Complete Data Safety form
- [ ] Submit for review

---

**Good luck with your launch! 🚀**
