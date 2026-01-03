# Reddit-like Identity Model - Implementation Guide

## ✅ What Was Implemented

### Backend (Ingestion Platform)

1. **Database Schema** (Prisma)
   - ✅ `User` model - Firebase UID, email, phone, verification status
   - ✅ `Persona` model - Anonymous + Verified personas per user
   - ✅ `Comment` model - Stores both `userId` (internal) and `personaId` (public)

2. **Firebase Admin SDK**
   - ✅ `config/firebase-admin.ts` - Token verification
   - ✅ Supports multiple initialization methods

3. **Persona Service**
   - ✅ `services/persona-service.ts` - Creates personas on first login
   - ✅ Generates anonymous usernames (`u/color-animal-number`)
   - ✅ Infers badges from Firebase provider

4. **Auth Endpoints**
   - ✅ `POST /auth/verify` - Verify token, create/update user + personas
   - ✅ `GET /auth/personas` - Get user's personas

### Frontend

1. **Auth API Client**
   - ✅ `api/apiAuth.ts` - `verifyAuth()`, `getPersonas()`

2. **Firebase Auth Context**
   - ✅ Auto-syncs with backend on sign-in
   - ✅ Stores personas in state
   - ✅ `syncWithBackend()` method

---

## 🔄 How It Works

### Sign-in Flow

```
User signs in (Google/Phone)
    ↓
Firebase Auth succeeds
    ↓
FirebaseAuthContext detects auth state change
    ↓
Calls verifyAuth() → POST /auth/verify
    ↓
Backend verifies Firebase token
    ↓
Backend upserts User
    ↓
Backend creates/updates personas:
    - Anonymous (default)
    - Verified (with badge)
    ↓
Returns user + personas
    ↓
Frontend stores in context + AsyncStorage
```

### Comment Flow (Next Step)

```
User taps "Comment"
    ↓
Show persona selector (Anonymous/Verified)
    ↓
User selects persona
    ↓
User writes comment
    ↓
Submit with personaId
    ↓
Backend stores:
    - userId (internal, for moderation)
    - personaId (public, what others see)
```

---

## 📋 Next Steps

### 1. Update Comment API

Update `api/apiComments.ts` to:
- Accept `personaId` parameter
- Send personaId to backend
- Display persona info in comments

### 2. Create Persona Selector UI

Create component:
- Shows current persona
- Allows switching between Anonymous/Verified
- Remembers last choice

### 3. Update Comment Display

Update comment components to:
- Show persona displayName
- Show persona avatar
- Show badge if verified

### 4. Add Comment Endpoints to Backend

Create endpoints:
- `POST /comments` - Create comment with personaId
- `GET /comments/:articleId` - Get comments with persona info

---

## 🧪 Testing

### Test Auth Flow

1. Sign in with Google/Phone
2. Check backend logs - should see user + personas created
3. Check `personas` in FirebaseAuthContext
4. Should have 2 personas: anonymous (default) + verified

### Test Persona Creation

```bash
# After sign-in, check personas
curl "http://192.168.0.101:3000/auth/personas" \
  -H "Authorization: Bearer <firebase_token>"
```

---

## 🔐 Security Notes

- ✅ Firebase tokens verified on backend
- ✅ User ID stored internally (for moderation)
- ✅ Persona ID shown publicly
- ✅ Email/phone never exposed in comments
- ✅ Anonymous persona always available

---

## 📝 Database Schema

```prisma
User {
  id, firebaseUid, email, phone, emailVerified, phoneVerified
}

Persona {
  id, userId, type, displayName, avatarUrl, badge, isDefault
}

Comment {
  id, articleId, userId (internal), personaId (public), body, parentId
}
```

---

**Reddit-like identity model is ready!** 🎉

Next: Add persona selector UI and update comment system.
