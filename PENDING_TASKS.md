# Pending Tasks - Reddit-like Identity Model

## ✅ What's Complete

### Backend ✅
- ✅ Database schema (User, Persona, Comment models + all related tables)
- ✅ Firebase Admin SDK setup
- ✅ Persona service (auto-creates personas)
- ✅ Auth endpoints (`/auth/verify`, `/auth/personas`)
- ✅ Comment service (CRUD, voting, reporting)
- ✅ Abuse detection service
- ✅ Rate limiting middleware
- ✅ All 7 comment endpoints

### Frontend Auth ✅
- ✅ Firebase Auth service
- ✅ Firebase Auth context (with personas)
- ✅ Auth API client

### Frontend Comments ✅
- ✅ PersonaSelector component
- ✅ Comment API (uses ingestion platform)
- ✅ Comment composer (with persona selector)
- ✅ Comment display (shows persona info)
- ✅ Optimistic updates
- ✅ Comment sorting (Top/New)
- ✅ Pull-to-refresh
- ✅ Edit/Delete UI
- ✅ Loading skeletons
- ✅ Error handling

---

## ⚠️ Critical: Apply Database Migration

**Status**: Migration file ready, needs manual application

**Action Required**:
```bash
cd ingestion-platform
npx prisma migrate dev --name add_comment_system_tables
```

**When prompted about unique constraint**, type `y` and press Enter.

**After migration**:
- Prisma Client will regenerate
- TypeScript errors will be resolved
- Backend endpoints will work
- Frontend can create comments

---

## 🚧 Optional Enhancements (For Later)

### 1. Redis-based Rate Limiting (Optional)
- **Status**: Currently uses Postgres
- **File**: `middleware/rate-limit.ts`
- **Benefit**: Better performance for high traffic
- **Priority**: Low (Postgres works fine for MVP

### 2. External Moderation API (Optional)
- **Status**: Currently uses basic heuristics
- **File**: `services/comment-service.ts`
- **Benefit**: Better toxicity detection (e.g., Perspective API)
- **Priority**: Low (basic detection works)

### 3. Comment Notifications (Future)
- **Status**: Not implemented
- **What's needed**: Push notifications for replies
- **Priority**: Low

### 4. Rich Text Support (Future)
- **Status**: Plain text only
- **What's needed**: Markdown, mentions, links
- **Priority**: Low

### 5. Image Uploads in Comments (Future)
- **Status**: Not implemented
- **What's needed**: Attach images to comments
- **Priority**: Low

---

## 📋 Testing Checklist

After applying migration:

### Backend Testing
- [ ] Start backend: `cd ingestion-platform && npm run dev`
- [ ] Test `POST /v1/posts/:postId/comments` (create comment)
- [ ] Test `GET /v1/posts/:postId/comments` (list comments)
- [ ] Test `POST /v1/comments/:commentId/vote` (vote)
- [ ] Test `PATCH /v1/comments/:commentId` (edit)
- [ ] Test `DELETE /v1/comments/:commentId` (delete)
- [ ] Test `POST /v1/comments/:commentId/report` (report)
- [ ] Test `POST /v1/users/:userId/block` (block)

### Frontend Testing
- [ ] Sign in with Firebase
- [ ] Open article and tap comment icon
- [ ] See persona selector
- [ ] Post comment (should appear instantly)
- [ ] Switch sort (Top/New)
- [ ] Pull to refresh
- [ ] Upvote/downvote comment
- [ ] Edit your comment
- [ ] Delete your comment
- [ ] Report a comment
- [ ] Block a user

---

## 🎯 Next Steps

1. **Apply migration** (required - 5 minutes)
2. **Test all features** (30 minutes)
3. **Fix any issues** (if any)
4. **Deploy to production** (when ready)

---

## 📚 Documentation

- `QUICK_START_COMMENTS.md` - Get started in 3 steps
- `COMMENT_SYSTEM_READY.md` - Complete status
- `COMMENT_SYSTEM_ENHANCEMENTS.md` - UX enhancements
- `MIGRATION_GUIDE.md` - Migration instructions
- `COMMENT_SYSTEM_FINAL.md` - Feature list

---

**Status**: All code complete. Just need to apply migration! 🚀
