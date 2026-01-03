# Better Inshorts Implementation Status

## ✅ Backend Complete

### Database Schema
- ✅ `Edition` - Daily edition container
- ✅ `EditionStory` - Today Edition membership (stable)
- ✅ `ExploreItem` - Explore Pool cache (dynamic)
- ✅ `UserStoryState` - Read/seen/saved/dismissed tracking
- ✅ `CategoryPreference` - User category preferences + manual ordering
- ✅ `CategoryRankingSignal` - Algorithm scoring for auto-ranking

### API Endpoints
- ✅ `GET /v2/discover/bootstrap` - Initial load with Today Edition + Explore Pool
- ✅ `GET /v2/discover/refresh` - Pull-to-refresh with delta updates

### Services
- ✅ `edition-generator.ts` - Generates Today Edition (12-15 stories, must-know + preferences)
- ✅ `explore-generator.ts` - Generates dynamic Explore Pool sections

### Features Implemented
- ✅ Today Edition stability (fixed daily list)
- ✅ Breaking additions (max 5/day, increments version)
- ✅ Category ordering (manual + auto hybrid)
- ✅ Explore Pool dynamic refresh

---

## 🚧 Frontend TODO

### 1. SQLite Local Database
- [ ] Create schema file with all tables
- [ ] Migration system
- [ ] Database client setup

### 2. Repository Layer
- [ ] `DiscoverRepo.ts` - All DB operations
- [ ] Methods: `upsertEdition`, `upsertStories`, `getHeroStack`, `getUnreadCount`, etc.

### 3. Sync Logic
- [ ] `bootstrap.ts` - Initial sync from `/v2/discover/bootstrap`
- [ ] `refresh.ts` - Pull-to-refresh from `/v2/discover/refresh`
- [ ] Merge logic for Today delta (added/updated/removed)

### 4. UI Components
- [ ] `HeroStack.tsx` - Today Edition card stack
- [ ] `UnreadPill.tsx` - Unread count + progress
- [ ] `CategoryRail.tsx` - Explore category sections
- [ ] `UpdatesBanner.tsx` - New updates notification
- [ ] `ConsumeModeScreen.tsx` - Dedicated reading mode

### 5. State Management
- [ ] Zustand/Redux store for Discover state
- [ ] ViewModels for hero stack, unread count, category rails

### 6. Viewability Tracking
- [ ] `useStoryViewability.ts` - FlatList viewability config
- [ ] Seen detection (60% visible, 500ms)
- [ ] Read detection (dwell timer 2500ms)

---

## 📋 Next Steps

1. **Test Backend APIs**:
   ```bash
   curl "http://192.168.0.101:3000/v2/discover/bootstrap?timezone=Asia/Kolkata" \
     -H "x-user-id: test-user"
   ```

2. **Implement Frontend SQLite Schema** (use the schema from the spec)

3. **Create DiscoverRepo** (follow the blueprint in the spec)

4. **Wire up UI Components** (HeroStack, UnreadPill, CategoryRail)

5. **Add Viewability Tracking** (read/seen detection)

---

## 🔑 Key Invariants (Must Maintain)

1. **Today membership never shrinks automatically** - Only on explicit dismiss or legal takedown
2. **Push never mutates UI** - Only shows banner/badge, requires pull-to-refresh
3. **Preferences don't reshuffle Today** - Unless user explicitly rebuilds
4. **Explore can refresh freely** - Dynamic, no completion constraints
5. **Completion only counts Today Edition** - Explore doesn't affect progress

---

## 📝 API Usage

### Bootstrap
```typescript
GET /v2/discover/bootstrap?timezone=Asia/Kolkata
Headers: x-user-id: <userId>

Response: {
  edition: { editionId, dateLocal, timezone, publishedAt, cutoffAt, mode, version },
  today: { stories: [...], editionStories: [...] },
  explore: { sections: [...], sectionOrder: [...] },
  preferences: [...],
  categorySignals: [...],
  serverTime: number
}
```

### Refresh
```typescript
GET /v2/discover/refresh?editionId=2026-01-03&since=timestamp&editionVersion=3
Headers: x-user-id: <userId>

Response: {
  editionId: string,
  editionVersion: number,
  today: {
    added: { stories: [...], editionStories: [...] },
    updated: { stories: [...], editionStories: [...] },
    removed: []
  },
  explore: { sections: [...] },
  sectionOrder: [...],
  serverTime: number
}
```

---

## 🎯 Constants

- `DAILY_EDITION_SIZE = 12`
- `MUST_KNOW_COUNT = 5`
- `BREAKING_THRESHOLD = 85`
- `MAX_DAILY_ADDITIONS = 5`
- `EXPLORE_PER_CATEGORY = 20`
