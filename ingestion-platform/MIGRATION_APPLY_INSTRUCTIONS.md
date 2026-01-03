# Migration Application Instructions

## ✅ Migration SQL Ready

The migration SQL file is ready at:
**`prisma/migrations/manual_migration.sql`**

This file contains all SQL statements needed to create the comment system tables.

---

## 🎯 Apply Migration (Choose One Method)

### Method 1: Interactive Prisma (Easiest) ⭐

```bash
cd ingestion-platform
npx prisma migrate dev --name add_comment_system_tables
```

**When prompted**: Type `y` and press Enter to confirm the unique constraint.

**This will**:
- ✅ Create the migration
- ✅ Apply it to database
- ✅ Regenerate Prisma Client
- ✅ Mark as applied

---

### Method 2: Direct SQL (If psql Available)

```bash
cd ingestion-platform

# Load DATABASE_URL from .env
export $(grep -v '^#' .env | xargs)

# Apply migration
psql "$DATABASE_URL" -f prisma/migrations/manual_migration.sql
```

---

### Method 3: Database Client (GUI)

1. **Open your PostgreSQL client** (pgAdmin, DBeaver, TablePlus, etc.)

2. **Connect to database**:
   - Host: `localhost` (or from your `.env`)
   - Port: `5432`
   - Database: `ingestion_db`
   - User/Password: From your `.env`

3. **Open SQL file**:
   - File: `ingestion-platform/prisma/migrations/manual_migration.sql`

4. **Execute SQL**:
   - Copy all SQL from the file
   - Paste into SQL editor
   - Execute/Run

---

## ✅ Verify Migration

After applying, verify it worked:

```bash
cd ingestion-platform

# Check migration status
npx prisma migrate status

# Or verify tables exist
psql "$DATABASE_URL" -c "\dt" | grep -E "(posts|comments|comment_votes)"
```

You should see:
- `posts`
- `comments`
- `comment_votes`
- `comment_reports`
- `user_blocks`
- `user_devices`

---

## 🔄 After Migration

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

4. **Test Endpoint**:
   ```bash
   curl "http://localhost:3000/v1/posts/test-post/comments"
   ```

Should return: `{"ok":true,"comments":[],"nextCursor":null}`

---

## 🐛 Troubleshooting

### Error: "relation already exists"
- Some tables may already exist
- The migration uses `IF NOT EXISTS`, so it's safe to run again
- Or manually drop tables if needed

### Error: "unique constraint violation"
- If `personas.handle` has duplicates
- You'll need to clean up duplicates first
- Or remove the unique constraint temporarily

### Error: "permission denied"
- Check database user permissions
- Ensure user can CREATE TABLE

---

## 📝 Migration SQL Summary

The migration:
- Creates 6 new tables
- Adds 2 columns to existing tables
- Creates 15+ indexes
- Sets up all foreign keys

**Total**: ~100 lines of SQL

---

**Ready to apply!** Choose Method 1 (interactive Prisma) for easiest experience. 🚀
