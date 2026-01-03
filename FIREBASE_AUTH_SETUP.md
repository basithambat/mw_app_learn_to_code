# Firebase Authentication Setup Guide

## ✅ Current Status

Your app already has:
- ✅ Firebase packages installed (`@react-native-firebase/app`, `@react-native-firebase/auth`)
- ✅ Firebase config files (`google-services.json`, `GoogleService-Info.plist`)
- ✅ Firebase initialized in iOS (`AppDelegate.mm`)
- ✅ Phone authentication working (`app/login/mobile/index.tsx`)
- ✅ Google Sign-in working (`app/login/loginScreen.tsx`)

## 🎯 What We Need to Do

1. **Create Firebase Auth Service** - Unified auth utilities
2. **Update Auth Context** - Proper Firebase integration
3. **Add Token Verification** - Verify Firebase tokens in backend
4. **Update Profile Endpoints** - Use Firebase tokens for authentication
5. **Unify Login Flow** - Both Google and Phone use Firebase

---

## 📋 Step-by-Step Implementation

### Step 1: Create Firebase Auth Service

Create `services/firebaseAuth.ts` with:
- Sign in with Google (via Firebase)
- Sign in with Phone (already working)
- Sign out
- Get current user
- Get ID token
- Auth state listener

### Step 2: Update Auth Context

Update `config/authContext.tsx` to:
- Use Firebase Auth state
- Listen to auth changes
- Provide user and token

### Step 3: Backend Token Verification

Update ingestion platform to:
- Verify Firebase ID tokens
- Extract user ID from token
- Secure profile endpoints

### Step 4: Update Login Screens

- Google login → Use Firebase Auth
- Phone login → Already using Firebase (keep as is)
- Store Firebase user in Redux

### Step 5: Update Profile API

- Send Firebase ID token in headers
- Backend verifies token
- Extract user ID from token

---

## 🔐 Firebase Console Setup

### Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `whatsay-app-c3627`
3. Go to **Authentication** → **Sign-in method**
4. Enable:
   - ✅ **Phone** (already enabled)
   - ✅ **Google** (enable if not already)

### Google Sign-in Setup

1. In Firebase Console → Authentication → Sign-in method
2. Click **Google**
3. Enable it
4. Add authorized domains if needed
5. Save

### Phone Authentication Setup

1. In Firebase Console → Authentication → Sign-in method
2. Click **Phone**
3. Enable it
4. Add test phone numbers if needed (for development)

---

## 🚀 Next Steps

I'll create:
1. `services/firebaseAuth.ts` - Auth service
2. Update `config/authContext.tsx` - Auth context
3. Update backend to verify tokens
4. Update login screens
5. Update profile API to use tokens

Ready to proceed? Let me know and I'll implement it!
