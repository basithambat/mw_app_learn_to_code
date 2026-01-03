# Reddit-like Comment System - Implementation Status

## ✅ What's Complete

### Database Schema (Prisma) ✅
- ✅ User model (with status: active/banned/shadow_banned)
- ✅ Persona model (with handle field - unique)
- ✅ Post model
- ✅ Comment model (with state, scores, moderation fields)
- ✅ CommentVote model
- ✅ CommentReport model
- ✅ UserBlock model
- ✅ UserDevice model

**Note**: Migration file created but needs to be applied manually:
```bash
cd ingestion-platform
npx prisma migrate dev
```

### Backend Services ✅
- ✅ `services/comment-service.ts` - Comment CRUD, voting, reporting
- ✅ `services/abuse-service.ts` - Spam detection, link detection, sanitization
- ✅ `middleware/auth-middleware.ts` - Firebase token verification

### Backend Endpoints ✅
- ✅ `POST /v1/posts/:postId/comments` - Create comment
- ✅ `GET /v1/posts/:postId/comments` - List comments (with pagination)
- ✅ `POST /v1/comments/:commentId/vote` - Vote comment
- ✅ `PATCH /v1/comments/:commentId` - Edit comment
- ✅ `DELETE /v1/comments/:commentId` - Delete comment
- ✅ `POST /v1/comments/:commentId/report` - Report comment
- ✅ `POST /v1/users/:userId/block` - Block user

**Note**: Endpoints created but Prisma client needs regeneration after migration.

---

## 🚧 What's Pending

### 1. Apply Database Migration ⚠️ **CRITICAL - DO FIRST**

**Status**: Migration file created, needs manual application

**Action Required**:
```bash
cd ingestion-platform
npx prisma migrate dev
# This will:
# 1. Apply the migration
# 2. Regenerate Prisma Client
# 3. Fix all TypeScript errors
```

**After migration**:
- Prisma Client will have new models
- TypeScript errors will be resolved
- Backend endpoints will work

---

### 2. Rate Limiting Middleware ⚠️ **HIGH PRIORITY**

**Status**: Not implemented

**What's needed**:
- Per-user rate limits
- Per-device rate limits
- Per-IP rate limits
- Adaptive throttling

**Files to create**:
- `ingestion-platform/src/middleware/rate-limit.ts`

**Suggested limits**:
- New user (<24h): 1 comment per 20s, max 5/day
- Regular: 1 comment per 10s, max 30/day
- Vote: 10 per 10s, max 500/day

---

### 3. Persona Selector Component ⚠️ **HIGH PRIORITY**

**Status**: Not created

**What's needed**:
- Component showing current persona
- Dropdown/bottom sheet to switch
- Shows badge if verified
- Remembers last choice

**Files to create**:
- `components/PersonaSelector.tsx`

---

### 4. Update Comment API ⚠️ **HIGH PRIORITY**

**Status**: Still uses Supabase

**What's needed**:
- Switch to ingestion platform endpoints
- Add `personaId` parameter
- Send Firebase token
- Handle persona info in responses

**Files to update**:
- `api/apiComments.ts` - Complete rewrite

---

### 5. Update Comment Composer ⚠️ **HIGH PRIORITY**

**Status**: Doesn't use personas

**What's needed**:
- Add persona selector
- Default to anonymous
- Pass `personaId` when submitting

**Files to update**:
- `components/comment/commentSectionModal.tsx`

---

### 6. Update Comment Display ⚠️ **MEDIUM PRIORITY**

**Status**: Shows user info, not persona

**What's needed**:
- Show persona displayName
- Show persona avatarUrl
- Show badge if verified
- Handle removed comments

**Files to update**:
- `components/comment/userComment.tsx`
- `components/comment/userReply.tsx`

---

### 7. Update Comment Types ⚠️ **MEDIUM PRIORITY**

**Status**: Types don't match backend

**What's needed**:
- Add `persona` field to `ArticleComment`
- Remove direct `user` field (or keep for backward compat)

**Files to update**:
- `app/types.ts`

---

## 📋 Implementation Checklist

### Backend
- [x] Database schema
- [x] Comment service
- [x] Abuse service
- [x] Auth middleware
- [x] Comment endpoints
- [ ] Apply migration (manual step)
- [ ] Rate limiting middleware
- [ ] Device tracking

### Frontend
- [ ] Persona selector component
- [ ] Update comment API
- [ ] Update comment composer
- [ ] Update comment display
- [ ] Update types

---

## 🚀 Next Steps (In Order)

1. **Apply migration** (5 min)
   ```bash
   cd ingestion-platform
   npx prisma migrate dev
   ```

2. **Test backend endpoints** (10 min)
   - Use curl or Postman
   - Test create comment
   - Test list comments

3. **Create persona selector** (20 min)
   - Component with dropdown
   - Store last choice

4. **Update comment API** (15 min)
   - Switch to ingestion platform
   - Add personaId

5. **Update comment composer** (15 min)
   - Add persona selector
   - Use personaId

---

## 🧪 Testing

After migration is applied:

```bash
# Create comment
curl -X POST "http://192.168.0.101:3000/v1/posts/test-post/comments" \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "<persona_id>",
    "body": "Test comment"
  }'

# List comments
curl "http://192.168.0.101:3000/v1/posts/test-post/comments?sort=new&limit=10" \
  -H "Authorization: Bearer <firebase_token>"
```

---

**Status**: Backend code is ready. Migration needs to be applied, then frontend integration.
