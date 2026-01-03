# Comment System - What's Pending

## ⚠️ Critical: Apply Database Migration

**Before anything else works**, you need to apply the database migration:

```bash
cd ingestion-platform
npx prisma migrate dev
```

This will:
1. Create all new tables (Post, Comment, CommentVote, CommentReport, UserBlock, UserDevice)
2. Add new fields to existing tables (User.status, Persona.handle, Comment state/scores)
3. Regenerate Prisma Client
4. Fix all TypeScript errors

**After this**, the backend will compile and work.

---

## 📋 Pending Tasks

### Backend (After Migration)

1. **Rate Limiting Middleware** (30 min)
   - Create `middleware/rate-limit.ts`
   - Implement per-user, per-device, per-IP limits
   - Add to comment endpoints

2. **Device Tracking** (20 min)
   - Track device_install_id in requests
   - Update UserDevice table
   - Use for abuse detection

### Frontend (Can Do Now)

3. **Persona Selector Component** (20 min)
   - `components/PersonaSelector.tsx`
   - Dropdown/bottom sheet
   - Shows current persona + badge

4. **Update Comment API** (15 min)
   - `api/apiComments.ts`
   - Switch from Supabase to ingestion platform
   - Add personaId parameter

5. **Update Comment Composer** (15 min)
   - Add persona selector
   - Use selected personaId

6. **Update Comment Display** (30 min)
   - Show persona info
   - Handle removed comments

---

## 🎯 Quick Start

1. **Apply migration** (required first)
2. **Create persona selector** (frontend)
3. **Update comment API** (frontend)
4. **Update comment composer** (frontend)
5. **Test end-to-end**

---

**Backend is 90% done. Just need migration applied!**
