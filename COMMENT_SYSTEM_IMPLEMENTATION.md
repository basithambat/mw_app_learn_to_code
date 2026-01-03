# Reddit-like Comment System - Implementation Status

## ✅ Completed

### Database Schema
- ✅ User model (with status field)
- ✅ Persona model (with handle field)
- ✅ Post model
- ✅ Comment model (with state, scores, moderation fields)
- ✅ CommentVote model
- ✅ CommentReport model
- ✅ UserBlock model
- ✅ UserDevice model

### Backend Auth
- ✅ Firebase Admin SDK setup
- ✅ `/auth/verify` endpoint
- ✅ `/auth/personas` endpoint
- ✅ Persona service (creates anonymous + verified)

### Frontend Auth
- ✅ Firebase Auth service
- ✅ Firebase Auth context (with personas)
- ✅ Auth API client

---

## 🚧 Pending (Critical)

### 1. Backend Comment Endpoints ⚠️ **DO THIS FIRST**

**Status**: Not created

**Endpoints needed**:
- `POST /v1/posts/:postId/comments` - Create comment
- `GET /v1/posts/:postId/comments` - List comments (with pagination)
- `POST /v1/comments/:commentId/vote` - Vote comment
- `PATCH /v1/comments/:commentId` - Edit comment
- `DELETE /v1/comments/:commentId` - Delete comment
- `POST /v1/comments/:commentId/report` - Report comment
- `POST /v1/users/:userId/block` - Block user

**Files to create**:
- `ingestion-platform/src/services/comment-service.ts`
- `ingestion-platform/src/middleware/rate-limit.ts`
- `ingestion-platform/src/middleware/abuse-detection.ts`
- Add routes to `ingestion-platform/src/index.ts`

---

### 2. Moderation & Anti-Abuse ⚠️ **CRITICAL**

**Status**: Not implemented

**What's needed**:
- Rate limiting (per user, device, IP)
- Abuse scoring
- Shadow ban logic
- Link detection
- Spam scoring
- Content sanitization

**Files to create**:
- `ingestion-platform/src/middleware/rate-limit.ts`
- `ingestion-platform/src/services/abuse-service.ts`
- `ingestion-platform/src/services/moderation-service.ts`

---

### 3. Persona Selector UI ⚠️ **HIGH PRIORITY**

**Status**: Not created

**What's needed**:
- Component to switch between Anonymous/Verified
- Shows current persona
- Shows badge if verified
- Remembers last choice

**Files to create**:
- `components/PersonaSelector.tsx`

---

### 4. Update Comment API ⚠️ **HIGH PRIORITY**

**Status**: Still uses Supabase

**What's needed**:
- Switch from Supabase to ingestion platform
- Add `personaId` parameter
- Send Firebase token in headers
- Handle persona info in responses

**Files to update**:
- `api/apiComments.ts` - Complete rewrite

---

### 5. Update Comment Composer ⚠️ **HIGH PRIORITY**

**Status**: Doesn't use personas

**What's needed**:
- Add persona selector
- Default to anonymous persona
- Pass `personaId` when submitting

**Files to update**:
- `components/comment/commentSectionModal.tsx`

---

### 6. Update Comment Display ⚠️ **MEDIUM PRIORITY**

**Status**: Shows user info, not persona info

**What's needed**:
- Show persona `displayName`
- Show persona `avatarUrl`
- Show badge if verified
- Handle removed comments

**Files to update**:
- `components/comment/userComment.tsx`
- `components/comment/userReply.tsx`

---

### 7. Update Comment Types ⚠️ **MEDIUM PRIORITY**

**Status**: Types don't include persona

**What's needed**:
- Add `persona` field to `ArticleComment`
- Update types to match backend

**Files to update**:
- `app/types.ts`

---

## 📋 Implementation Order

### Phase 1: Backend (2-3 hours)
1. ✅ Database schema (DONE)
2. ⚠️ Comment service
3. ⚠️ Comment endpoints
4. ⚠️ Rate limiting middleware
5. ⚠️ Abuse detection

### Phase 2: Frontend Core (1-2 hours)
6. ⚠️ Persona selector component
7. ⚠️ Update comment API
8. ⚠️ Update comment composer

### Phase 3: Frontend Display (30 min)
9. ⚠️ Update comment display
10. ⚠️ Update types

---

## 🎯 Next Immediate Steps

1. **Apply database migration** (if not done)
2. **Create comment service** (`services/comment-service.ts`)
3. **Create comment endpoints** (add to `index.ts`)
4. **Create persona selector** (`components/PersonaSelector.tsx`)
5. **Update comment API** (`api/apiComments.ts`)

---

**Current Status**: Database ready. Backend endpoints and frontend UI pending.
