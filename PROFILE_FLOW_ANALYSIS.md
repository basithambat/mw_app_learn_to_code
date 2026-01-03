# Profile Flow Analysis & Plan

## 📋 Current State

### ✅ Existing Screens

1. **ProfileScreen** (`app/(tabs)/profileScreen.tsx`)
   - Main profile hub
   - Shows user avatar, name
   - Menu items: Profile, Preferences, Activity, Privacy Settings

2. **Profile Details** (`app/(tabs)/profile/profile.tsx`)
   - Edit profile picture
   - Edit name (modal)
   - Edit email (modal)
   - Logout
   - Test n8n connection

3. **Preferences** (`app/(tabs)/profile/preferences.tsx`)
   - Drag-to-reorder categories
   - Enable/disable categories
   - Save preferences

4. **Activity** (`app/(tabs)/profile/activity.tsx`)
   - Shows news articles user commented on
   - Comment history with timestamps

5. **Privacy Settings** (`app/(tabs)/profile/privacy/index.tsx`)
   - Privacy Policy link
   - Terms & Conditions link
   - Delete account

### 🔌 Current Backend Integration

#### Supabase (Primary)
- **Users Table**: User storage, login, profile data
- **Categories Table**: Category definitions
- **Comments Table**: User comments on articles

#### REST API (`https://whatsay.news:8080/api`)
- `PUT /user/update/${userId}` - Update name/email
- `PUT /user/profile-picture/${userId}` - Update profile picture
- `GET /userActivity/${userId}` - Get user activity
- `GET /categoriesWithPreferences/${userId}` - Get categories with user preferences
- `PUT /updateUserCategoriesPreferences/${userId}` - Update category preferences

### ⚠️ Issues Found

1. **Mixed Backend**: Uses both Supabase and REST API
2. **No Integration with Ingestion Platform**: Profile preferences not synced with Better Inshorts
3. **Missing Backend**: REST API endpoints may not exist (pointing to `whatsay.news:8080`)
4. **Preferences Not Connected**: Category preferences not integrated with `/v2/discover` API

---

## 🎯 Profile Flow Plan

### Phase 1: Unify Backend (Recommended)

**Option A: Use Supabase Only** (Simplest)
- Move all user operations to Supabase
- Remove REST API dependencies
- Pros: Simpler, already working
- Cons: No integration with ingestion platform

**Option B: Use Ingestion Platform** (Best for Better Inshorts)
- Add user/profile endpoints to ingestion platform
- Sync with Supabase for auth
- Pros: Unified backend, Better Inshorts integration
- Cons: More work

**Option C: Hybrid** (Current State)
- Keep Supabase for auth/users
- Use ingestion platform for preferences/discover
- Pros: Minimal changes
- Cons: Two backends to maintain

### Phase 2: Integrate with Better Inshorts

Connect profile preferences to `/v2/discover`:
- User category preferences → Today Edition generation
- Manual category order → Section ordering
- Enable/disable categories → Explore Pool filtering

---

## 📐 Recommended Implementation

### Step 1: Create Profile API in Ingestion Platform

Add endpoints to `ingestion-platform/src/index.ts`:

```typescript
// GET /v2/user/profile
// PUT /v2/user/profile
// PUT /v2/user/profile-picture
// GET /v2/user/activity
// POST /v2/user/preferences (already exists in Better Inshorts)
```

### Step 2: Update Frontend to Use Unified API

Create `api/apiProfile.ts`:
- Profile operations
- Preferences sync
- Activity fetching

### Step 3: Connect Preferences to Discover

- When user updates preferences → sync to ingestion platform
- When Discover bootstrap → use user preferences
- When user drags categories → update `CategoryPreference` in DB

---

## 🚀 Quick Implementation Plan

### Immediate (30 min)
1. ✅ Document current flow
2. ✅ Identify gaps
3. ✅ Create unified API client

### Short-term (2 hours)
1. Add profile endpoints to ingestion platform
2. Update frontend to use new endpoints
3. Sync preferences with Better Inshorts

### Long-term (Optional)
1. Migrate all user data to ingestion platform
2. Remove Supabase dependency (or keep for auth only)
3. Add profile picture upload to S3/Minio

---

## 📝 Current Flow Diagram

```
ProfileScreen
├── Profile Details
│   ├── Edit Picture → REST API `/user/profile-picture/${id}`
│   ├── Edit Name → REST API `/user/update/${id}`
│   ├── Edit Email → REST API `/user/update/${id}`
│   └── Logout → Local (AsyncStorage + Redux)
│
├── Preferences
│   ├── Load → REST API `/categoriesWithPreferences/${id}`
│   ├── Drag/Reorder → Local state
│   └── Save → REST API `/updateUserCategoriesPreferences/${id}`
│
├── Activity
│   └── Load → REST API `/userActivity/${id}`
│
└── Privacy
    ├── Privacy Policy → External URL
    ├── Terms → External URL
    └── Delete Account → Supabase `users.delete()`
```

---

## 🔧 Next Steps

Would you like me to:
1. **Create profile endpoints in ingestion platform** (recommended)
2. **Update frontend to use ingestion platform APIs**
3. **Integrate preferences with Better Inshorts**
4. **All of the above**

Let me know and I'll implement it!
