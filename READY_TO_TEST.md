# Ready to Test - Comment System

## ✅ Status: All Code Complete & Build Successful!

- ✅ Backend compiles (0 TypeScript errors)
- ✅ Prisma Client generated
- ✅ Migration SQL ready
- ✅ All endpoints implemented
- ✅ All frontend components ready

---

## 🚀 Apply Migration (Required First Step)

### Method 1: Interactive Prisma (Recommended) ⭐

Open a terminal and run:

```bash
cd ingestion-platform
npx prisma migrate dev --name add_comment_system_tables
```

**When prompted** about the unique constraint, type `y` and press Enter.

This will:
- ✅ Create the migration
- ✅ Apply it to database
- ✅ Regenerate Prisma Client
- ✅ Mark as applied

---

### Method 2: Manual SQL

If Method 1 doesn't work, use your database client:

1. **Open PostgreSQL client** (pgAdmin, DBeaver, TablePlus, etc.)

2. **Connect** using connection string from `.env`:
   ```
   postgresql://user:password@localhost:5432/ingestion_db
   ```

3. **Open SQL file**:
   - `ingestion-platform/prisma/migrations/manual_migration.sql`

4. **Execute** all SQL statements

---

## 🧪 Test Backend

### 1. Start Backend
```bash
cd ingestion-platform
npm run dev
```

Should see:
```
✅ API Server listening on port 3000
```

### 2. Test List Comments (No Auth)
```bash
curl "http://localhost:3000/v1/posts/test-post/comments?sort=new"
```

**Expected Response**:
```json
{"ok":true,"comments":[],"nextCursor":null}
```

If you get this, migration worked! ✅

### 3. Test Create Comment (Requires Auth)
```bash
# First, get a Firebase token from your app
# Then:
curl -X POST "http://localhost:3000/v1/posts/test-post/comments" \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "<persona_id>",
    "body": "Test comment"
  }'
```

---

## 🧪 Test Frontend

### 1. Start Expo
```bash
npx expo start
```

### 2. Test Flow
1. **Sign in** with Firebase (Phone OTP or Google)
2. **Open any article**
3. **Tap comment icon**
4. **You should see**:
   - Persona selector (Anonymous/Verified)
   - Comment input
   - Sort toggle (Top/New)
   - Pull-to-refresh

### 3. Test Features
- [ ] Post a comment (should appear instantly)
- [ ] Switch persona (Anonymous ↔ Verified)
- [ ] Sort comments (Top/New)
- [ ] Pull to refresh
- [ ] Upvote/downvote (should update instantly)
- [ ] Edit your comment
- [ ] Delete your comment
- [ ] Report a comment
- [ ] Block a user

---

## ✅ Success Indicators

### Backend Working
- ✅ Server starts without errors
- ✅ `GET /v1/posts/:postId/comments` returns `{"ok":true,"comments":[]}`
- ✅ No database errors in logs

### Frontend Working
- ✅ Comment section opens
- ✅ Persona selector shows
- ✅ Can post comments
- ✅ Comments appear instantly (optimistic update)
- ✅ Can vote, edit, delete

---

## 🐛 Troubleshooting

### Migration Fails
- Check database connection in `.env`
- Ensure database user has CREATE TABLE permissions
- Check for existing tables (migration uses IF NOT EXISTS)

### Backend Won't Start
- Check if port 3000 is available
- Check database connection
- Check Firebase Admin config

### Comments Not Showing
- Check backend is running
- Check API base URL in `api/apiIngestion.ts`
- Check Firebase token is being sent
- Check browser/Expo console for errors

---

## 📊 Test Results Template

After testing, note:
- [ ] Migration applied successfully
- [ ] Backend starts
- [ ] List comments works
- [ ] Create comment works
- [ ] Frontend shows comments
- [ ] All features work

---

**Next**: Apply migration using Method 1 above, then test! 🚀
