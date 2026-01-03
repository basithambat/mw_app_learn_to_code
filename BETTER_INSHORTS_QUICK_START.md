# Better Inshorts - Quick Start Guide

## ✅ Implementation Complete!

All backend and frontend code is ready. Here's how to use it:

---

## 🚀 Quick Start

### 1. Backend is Running ✅
The ingestion platform API is already running with the new endpoints:
- `GET /v2/discover/bootstrap`
- `GET /v2/discover/refresh`

### 2. Frontend Integration

#### Option A: Replace Existing DiscoverScreen

In your router file (e.g., `app/(tabs)/index.tsx` or wherever DiscoverScreen is used):

```tsx
// OLD:
import DiscoverScreen from '@/components/DiscoverScreen';

// NEW:
import { DiscoverScreenV2 } from '@/components/DiscoverScreen/DiscoverScreenV2';

// Then use:
<DiscoverScreenV2 />
```

#### Option B: Create New Route

Add a new tab/screen that uses `DiscoverScreenV2`.

---

## 📁 Files Created

### Backend (Ingestion Platform)
- ✅ `prisma/schema.prisma` - Extended with new models
- ✅ `src/services/edition-generator.ts` - Today Edition generation
- ✅ `src/services/explore-generator.ts` - Explore Pool generation
- ✅ `src/index.ts` - New API endpoints added

### Frontend (React Native)
- ✅ `src/db/schema.sql` - SQLite schema
- ✅ `src/db/client.ts` - Database client
- ✅ `src/db/repo/DiscoverRepo.ts` - Repository layer
- ✅ `src/types/discover.ts` - TypeScript types
- ✅ `src/api/discover.ts` - API client
- ✅ `src/sync/bootstrap.ts` - Initial sync
- ✅ `src/sync/refresh.ts` - Pull-to-refresh sync
- ✅ `src/hooks/useStoryViewability.ts` - Read/seen tracking
- ✅ `components/DiscoverScreen/HeroStack.tsx` - Today Edition stack
- ✅ `components/DiscoverScreen/UnreadPill.tsx` - Unread count
- ✅ `components/DiscoverScreen/UpdatesBanner.tsx` - Updates banner
- ✅ `components/DiscoverScreen/CategoryRail.tsx` - Category sections
- ✅ `components/DiscoverScreen/DiscoverScreenV2.tsx` - Main screen

---

## 🧪 Test It

### 1. Test Backend API

```bash
curl "http://192.168.0.101:3000/v2/discover/bootstrap?timezone=Asia/Kolkata" \
  -H "x-user-id: test-user" | jq '.edition.editionId'
```

Should return: `"2026-01-03"`

### 2. Test Frontend

1. Replace DiscoverScreen with DiscoverScreenV2
2. Reload Expo app
3. You should see:
   - Hero Stack (Today Edition cards)
   - Unread Pill (if unread items)
   - Category Rails (Explore Pool)

---

## 🎯 Key Features

✅ **Today Edition** - Stable 12-15 stories, doesn't disappear  
✅ **Explore Pool** - Dynamic category rails  
✅ **Pull-to-Refresh** - Syncs both inventories  
✅ **Read/Seen Tracking** - Automatic via viewability  
✅ **Unread Count** - Shows Today Edition progress  
✅ **Updates Banner** - New content notifications  

---

## 🔧 Configuration

### User ID
The screen uses Redux `loggedInUserDataSelector` for userId. If not logged in, uses `'anonymous'`.

### Timezone
Currently hardcoded to `'Asia/Kolkata'`. Can be made dynamic.

### API Base URL
Uses the same `getIngestionApiBase()` from `api/apiIngestion.ts`.

---

## 📝 Next Steps (Optional)

1. **Consume Mode** - Create dedicated reading screen
2. **Preferences** - Category drag-to-reorder UI
3. **Push Notifications** - Background inbox integration
4. **Midnight Rollover** - Auto-archive today edition

---

## 🐛 Troubleshooting

### Database not initializing?
- Check that `expo-sqlite` is installed: `npm list expo-sqlite`
- Database auto-initializes on first `getDatabase()` call

### API not responding?
- Check ingestion platform is running: `curl http://192.168.0.101:3000/api/sources`
- Verify IP address in `api/apiIngestion.ts`

### No stories showing?
- Check backend has content: `curl http://192.168.0.101:3000/api/feed?limit=5`
- Check console logs for bootstrap errors

---

**Everything is ready to use!** Just replace DiscoverScreen with DiscoverScreenV2. 🎉
