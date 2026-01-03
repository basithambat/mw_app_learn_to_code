# Profile Flow - Screen Inventory

## 📱 Existing Screens

### 1. ProfileScreen (Main Hub)
**File**: `app/(tabs)/profileScreen.tsx`
**Purpose**: Entry point for profile section
**Features**:
- User avatar display
- User name display
- Navigation menu to sub-screens

**Navigation**:
- → Profile Details
- → Preferences
- → Activity
- → Privacy Settings

---

### 2. Profile Details Screen
**File**: `app/(tabs)/profile/profile.tsx`
**Purpose**: Edit user profile information
**Features**:
- ✅ Edit profile picture (ImagePicker)
- ✅ Edit name (Modal)
- ✅ Edit email (Modal)
- ✅ Logout
- ⚠️ Test n8n connection (dev feature)

**API Calls**:
- `PUT /user/profile-picture/${userId}` - Update picture
- `PUT /user/update/${userId}` - Update name/email

**Backend**: REST API (`whatsay.news:8080`)

---

### 3. Preferences Screen
**File**: `app/(tabs)/profile/preferences.tsx`
**Purpose**: Manage category preferences and ordering
**Features**:
- ✅ Drag-to-reorder categories (DraggableFlatList)
- ✅ Enable/disable categories (checkbox)
- ✅ Save preferences
- ✅ Category icons display

**API Calls**:
- `GET /categoriesWithPreferences/${userId}` - Load preferences
- `PUT /updateUserCategoriesPreferences/${userId}` - Save preferences

**Backend**: REST API (`whatsay.news:8080`)

**Integration**: ⚠️ NOT connected to Better Inshorts `/v2/discover`

---

### 4. Activity Screen
**File**: `app/(tabs)/profile/activity.tsx`
**Purpose**: Show user's comment activity
**Features**:
- ✅ List of articles user commented on
- ✅ Comment text and timestamp
- ✅ Article thumbnail and title

**API Calls**:
- `GET /userActivity/${userId}` - Get activity logs

**Backend**: REST API (`whatsay.news:8080`)

---

### 5. Privacy Settings Screen
**File**: `app/(tabs)/profile/privacy/index.tsx`
**Purpose**: Privacy and account management
**Features**:
- ✅ Privacy Policy link (external)
- ✅ Terms & Conditions link (external)
- ✅ Delete account

**API Calls**:
- `DELETE /users` (Supabase) - Delete account

**Backend**: Supabase

---

## 🔄 Current Flow

```
User opens Profile
    ↓
ProfileScreen (Hub)
    ├─→ Profile Details
    │   ├─ Edit Picture → REST API
    │   ├─ Edit Name → REST API
    │   ├─ Edit Email → REST API
    │   └─ Logout → Local
    │
    ├─→ Preferences
    │   ├─ Load → REST API
    │   ├─ Reorder → Local
    │   └─ Save → REST API
    │
    ├─→ Activity
    │   └─ Load → REST API
    │
    └─→ Privacy
        ├─ Privacy Policy → External URL
        ├─ Terms → External URL
        └─ Delete → Supabase
```

---

## ⚠️ Issues & Gaps

1. **Backend Fragmentation**
   - Some operations use Supabase
   - Some use REST API (`whatsay.news:8080`)
   - REST API may not be running/accessible

2. **Preferences Not Integrated**
   - Preferences saved to REST API
   - Better Inshorts uses `/v2/discover` (different system)
   - No sync between them

3. **Missing Error Handling**
   - Some API calls don't handle failures gracefully
   - No retry logic
   - No offline support

4. **Profile Picture Storage**
   - Currently uses REST API
   - Should use S3/Minio (like ingestion platform)

---

## ✅ What's Working

- ✅ All screens exist and are functional
- ✅ UI/UX is complete
- ✅ Navigation flow works
- ✅ Supabase integration for users works
- ✅ Local state management (Redux) works

---

## 🎯 Recommended Next Steps

1. **Create Profile API in Ingestion Platform**
   - Unified backend for all profile operations
   - Integrate with Better Inshorts preferences

2. **Update Frontend API Clients**
   - Create `api/apiProfile.ts`
   - Migrate from REST API to ingestion platform

3. **Sync Preferences**
   - Connect preferences screen to `/v2/user/preferences`
   - Auto-sync with Better Inshorts

4. **Profile Picture Upload**
   - Use S3/Minio (same as ingestion platform)
   - Update ingestion platform to handle uploads

---

**All screens are built and functional. The main gap is backend integration and Better Inshorts sync.**
