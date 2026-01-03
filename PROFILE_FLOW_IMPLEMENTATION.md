# Profile Flow - Implementation Plan & Status

## ✅ What's Done

### Backend (Ingestion Platform)
1. ✅ **Profile Endpoints Added**:
   - `GET /v2/user/profile` - Get user profile + preferences
   - `PUT /v2/user/profile` - Update profile (name, email, timezone)
   - `POST /v2/user/profile-picture` - Upload profile picture to S3
   - `POST /v2/user/preferences` - Save category preferences
   - `GET /v2/user/activity` - Get user activity (placeholder)

2. ✅ **Profile Service Created**:
   - `src/services/profile-service.ts` - Profile operations
   - Profile picture upload to S3/Minio
   - Integration with CategoryPreference model

3. ✅ **Multipart Support**:
   - `@fastify/multipart` installed and registered
   - File upload handling for profile pictures

### Frontend
1. ✅ **Unified API Client**:
   - `api/apiProfile.ts` - All profile operations
   - Uses ingestion platform APIs
   - TypeScript types included

---

## 🚧 What's Next

### Step 1: Update Profile Screens (In Progress)

**Files to Update**:
- `app/(tabs)/profile/profile.tsx` - Use `ProfileApi.updateProfile()` and `ProfileApi.uploadProfilePicture()`
- `app/(tabs)/profile/preferences.tsx` - Use `ProfileApi.savePreferences()`
- `app/(tabs)/profile/activity.tsx` - Use `ProfileApi.getActivity()`

### Step 2: Sync Preferences with Better Inshorts

When user saves preferences:
1. Call `POST /v2/user/preferences` (already done)
2. Preferences stored in `CategoryPreference` table
3. `/v2/discover/bootstrap` already reads from this table ✅

**Status**: Already integrated! Preferences screen just needs to use new API.

### Step 3: Profile Picture Upload

Update `profile/profile.tsx`:
- Replace REST API call with `ProfileApi.uploadProfilePicture()`
- Image uploads to S3/Minio
- URL returned and stored

---

## 📋 Implementation Checklist

- [x] Backend endpoints created
- [x] API client created
- [ ] Update profile.tsx to use new API
- [ ] Update preferences.tsx to use new API
- [ ] Update activity.tsx to use new API
- [ ] Test profile picture upload
- [ ] Test preferences sync with Better Inshorts

---

## 🔄 Migration Path

### Current State
- Profile operations → REST API (`whatsay.news:8080`)
- Preferences → REST API
- Activity → REST API

### Target State
- Profile operations → Ingestion Platform (`/v2/user/*`)
- Preferences → Ingestion Platform (`/v2/user/preferences`)
- Activity → Ingestion Platform (`/v2/user/activity`) + Supabase

### Benefits
- ✅ Unified backend
- ✅ Preferences sync with Better Inshorts
- ✅ Profile pictures in S3 (same as content images)
- ✅ Better error handling
- ✅ Local IP support (works with physical devices)

---

## 🧪 Testing

### Test Profile API
```bash
# Get profile
curl "http://192.168.0.101:3000/v2/user/profile" \
  -H "x-user-id: test-user"

# Save preferences
curl -X POST "http://192.168.0.101:3000/v2/user/preferences" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "categories": [
      {"categoryId": "business", "enabled": true, "manualOrder": 1},
      {"categoryId": "sports", "enabled": true, "manualOrder": 2}
    ]
  }'
```

---

**Ready to update frontend screens!** 🚀
