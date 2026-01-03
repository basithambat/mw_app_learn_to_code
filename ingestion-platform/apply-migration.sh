#!/bin/bash

# Apply Comment System Migration
# This script applies the database migration for the comment system

set -e

echo "🚀 Applying comment system migration..."

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Generate migration SQL file
echo "📝 Generating migration SQL..."
npx prisma migrate dev --create-only --name add_comment_system_tables 2>&1 | grep -v "non-interactive" || true

# Find the migration file
MIGRATION_FILE=$(find prisma/migrations -name "*add_comment_system_tables" -type d | head -1)/migration.sql

if [ -f "$MIGRATION_FILE" ]; then
    echo "✅ Migration file found: $MIGRATION_FILE"
    echo "📋 Review the migration SQL above"
    echo ""
    echo "To apply manually:"
    echo "  psql \$DATABASE_URL -f $MIGRATION_FILE"
    echo ""
    echo "Or run interactively:"
    echo "  npx prisma migrate dev --name add_comment_system_tables"
else
    echo "⚠️  Migration file not found. Creating manual SQL..."
    
    # Create manual migration SQL
    cat > prisma/migrations/manual_migration.sql << 'EOF'
-- Add status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add handle to personas table
ALTER TABLE personas ADD COLUMN IF NOT EXISTS handle VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS personas_handle_unique ON personas(handle);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    post_id VARCHAR(255) PRIMARY KEY,
    story_id VARCHAR(255),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id VARCHAR(255) NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    state VARCHAR(50) DEFAULT 'visible',
    spam_score FLOAT,
    toxicity_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS comments_post_id_created_at ON comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_id_score ON comments(post_id, score DESC);
CREATE INDEX IF NOT EXISTS comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_persona_id ON comments(persona_id);
CREATE INDEX IF NOT EXISTS comments_user_id_created_at ON comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_state ON comments(state);

-- Create comment_votes table
CREATE TABLE IF NOT EXISTS comment_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote VARCHAR(10) NOT NULL,
    UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS comment_votes_comment_id ON comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS comment_votes_user_id ON comment_votes(user_id);

-- Create comment_reports table
CREATE TABLE IF NOT EXISTS comment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    reported_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comment_reports_comment_id ON comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS comment_reports_reported_by_user_id ON comment_reports(reported_by_user_id);
CREATE INDEX IF NOT EXISTS comment_reports_status ON comment_reports(status);

-- Create user_blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS user_blocks_blocker_user_id ON user_blocks(blocker_user_id);
CREATE INDEX IF NOT EXISTS user_blocks_blocked_user_id ON user_blocks(blocked_user_id);

-- Create user_devices table
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_install_id VARCHAR(255) NOT NULL,
    risk_score INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    device_meta JSONB,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, device_install_id)
);

CREATE INDEX IF NOT EXISTS user_devices_device_install_id ON user_devices(device_install_id);
CREATE INDEX IF NOT EXISTS user_devices_user_id ON user_devices(user_id);
EOF

    echo "✅ Created manual migration SQL at: prisma/migrations/manual_migration.sql"
    echo ""
    echo "To apply:"
    echo "  psql \$DATABASE_URL -f prisma/migrations/manual_migration.sql"
fi

echo ""
echo "✅ Migration preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review the migration SQL"
echo "2. Apply it: psql \$DATABASE_URL -f [migration_file]"
echo "3. Run: npx prisma generate"
echo "4. Test: npm run build"
