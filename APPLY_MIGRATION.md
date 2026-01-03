# Apply Database Migration - Step by Step

## 🚀 Quick Apply

The migration SQL is ready at: `ingestion-platform/prisma/migrations/manual_migration.sql`

### Option 1: Using psql (Recommended)
```bash
cd ingestion-platform
psql "$DATABASE_URL" -f prisma/migrations/manual_migration.sql
```

### Option 2: Using Database Client
1. Open your PostgreSQL client (pgAdmin, DBeaver, TablePlus, etc.)
2. Connect to your database using the connection string from `.env`
3. Open the file: `ingestion-platform/prisma/migrations/manual_migration.sql`
4. Copy and paste the SQL into your client
5. Execute it

### Option 3: Interactive Prisma (Easiest)
```bash
cd ingestion-platform
npx prisma migrate dev --name add_comment_system_tables
```
When prompted about the unique constraint, type `y` and press Enter.

---

## ✅ After Migration

1. **Regenerate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Build Backend**:
   ```bash
   npm run build
   ```

3. **Start Backend**:
   ```bash
   npm run dev
   ```

4. **Test**:
   ```bash
   curl "http://localhost:3000/v1/posts/test-post/comments"
   # Should return: {"ok":true,"comments":[],"nextCursor":null}
   ```

---

## 📋 What the Migration Creates

- ✅ `posts` table
- ✅ `comments` table (with all moderation fields)
- ✅ `comment_votes` table
- ✅ `comment_reports` table
- ✅ `user_blocks` table
- ✅ `user_devices` table
- ✅ Adds `status` column to `users`
- ✅ Adds `handle` column to `personas`
- ✅ All indexes and foreign keys

---

## 🧪 Quick Test After Migration

```bash
# Test list comments (no auth needed)
curl "http://localhost:3000/v1/posts/test-post/comments?sort=new"

# Should return:
# {"ok":true,"comments":[],"nextCursor":null}
```

If you get this response, the migration worked! 🎉

---

**Ready to apply!** Choose one method above and run it. 🚀
