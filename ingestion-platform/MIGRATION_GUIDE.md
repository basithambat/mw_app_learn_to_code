# Database Migration Guide

## Apply Comment System Migration

The comment system requires new database tables and fields. Follow these steps:

### Step 1: Check Current Migration Status

```bash
cd ingestion-platform
npx prisma migrate status
```

### Step 2: Apply Migration

```bash
npx prisma migrate dev --name add_comment_system_tables
```

**Note**: If prompted about:
- "A unique constraint covering the columns `[handle]` on the table `personas` will be added"
  - Answer: **Yes** (this is expected)

### Step 3: Verify Migration

```bash
npx prisma migrate status
```

Should show: "Database schema is up to date"

### Step 4: Regenerate Prisma Client

```bash
npx prisma generate
```

### Step 5: Test Backend Compilation

```bash
npm run build
```

Should compile without errors.

---

## Alternative: Manual Migration (If Interactive Mode Fails)

If `prisma migrate dev` fails due to non-interactive mode, you can:

1. **Generate migration SQL file**:
```bash
npx prisma migrate dev --create-only --name add_comment_system_tables
```

2. **Review the generated SQL** in `prisma/migrations/[timestamp]_add_comment_system_tables/migration.sql`

3. **Apply manually** using psql or your database client:
```bash
psql $DATABASE_URL -f prisma/migrations/[timestamp]_add_comment_system_tables/migration.sql
```

4. **Mark as applied**:
```bash
npx prisma migrate resolve --applied add_comment_system_tables
```

5. **Generate Prisma Client**:
```bash
npx prisma generate
```

---

## What the Migration Creates

### New Tables
- `posts` - News posts/articles
- `comments` - Comments with moderation fields
- `comment_votes` - Upvote/downvote tracking
- `comment_reports` - Comment reports
- `user_blocks` - User blocking
- `user_devices` - Device tracking for abuse detection

### Modified Tables
- `users` - Added `status` field (active/banned/shadow_banned)
- `personas` - Added `handle` field (unique)

### Indexes
- Multiple indexes for performance on comments, votes, reports

---

## Troubleshooting

### Error: "Unique constraint already exists"
- This means the migration was partially applied
- Check `prisma migrate status` to see what's missing
- You may need to manually add missing constraints

### Error: "Column already exists"
- Some fields may already exist
- Check your current schema vs. the migration
- You may need to adjust the migration SQL

### Error: "Cannot find module '@prisma/client'"
- Run: `npm install`
- Then: `npx prisma generate`

---

## After Migration

1. ✅ Backend will compile
2. ✅ Comment endpoints will work
3. ✅ Frontend can create comments
4. ✅ Personas will work correctly

---

**Ready to proceed?** Run the migration command above! 🚀
