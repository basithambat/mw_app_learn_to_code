# Migration Applied - Testing Guide

## ✅ Migration Status

A migration SQL file has been created to add the missing fields and tables:
- **File**: `ingestion-platform/prisma/migrations/add_missing_comment_fields.sql`

This migration adds:
- `status` column to `users`
- `handle` column to `personas`
- `posts` table
- New fields to `comments` (post_id, upvotes, downvotes, score, state, etc.)
- `comment_votes` table
- `comment_reports` table
- `user_blocks` table
- `user_devices` table

---

## 🚀 Apply Migration

### Option 1: Using psql
```bash
cd ingestion-platform
psql "$DATABASE_URL" -f prisma/migrations/add_missing_comment_fields.sql
```

### Option 2: Using Database Client
1. Open your PostgreSQL client
2. Connect to database
3. Run SQL from: `prisma/migrations/add_missing_comment_fields.sql`

### Option 3: Interactive Prisma
```bash
cd ingestion-platform
npx prisma migrate dev --name add_missing_comment_fields
```

---

## 🧪 Test After Migration

### 1. Regenerate Prisma Client
```bash
cd ingestion-platform
npx prisma generate
```

### 2. Build Backend
```bash
npm run build
# Should succeed
```

### 3. Start Backend
```bash
npm run dev
# Should start on port 3000
```

### 4. Test Endpoint
```bash
curl "http://localhost:3000/v1/posts/test-post/comments?sort=new"
# Expected: {"ok":true,"comments":[],"nextCursor":null}
```

---

## ✅ Success Indicators

- ✅ Migration SQL applied without errors
- ✅ Backend compiles successfully
- ✅ Backend starts on port 3000
- ✅ Comment endpoint returns valid JSON
- ✅ No database errors in logs

---

**Apply migration and test!** 🚀
