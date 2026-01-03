-- Migration: Add missing comment system fields and tables
-- This adds the new fields and tables that were added to the schema

-- Add status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);

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

-- Update comments table: add new fields
ALTER TABLE comments ADD COLUMN IF NOT EXISTS post_id VARCHAR(255);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS state VARCHAR(50) DEFAULT 'visible';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS spam_score FLOAT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS toxicity_score FLOAT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Migrate article_id to post_id if needed
UPDATE comments SET post_id = article_id WHERE post_id IS NULL AND article_id IS NOT NULL;

-- Add foreign key for post_id
ALTER TABLE comments ADD CONSTRAINT IF NOT EXISTS comments_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE;

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS comments_post_id_created_at ON comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_id_score ON comments(post_id, score DESC);
CREATE INDEX IF NOT EXISTS comments_user_id_created_at ON comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_state ON comments(state);

-- Create comment_votes table
CREATE TABLE IF NOT EXISTS comment_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote VARCHAR(10) NOT NULL,
    UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS comment_votes_comment_id ON comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS comment_votes_user_id ON comment_votes(user_id);

-- Create comment_reports table
CREATE TABLE IF NOT EXISTS comment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    reported_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    blocker_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS user_blocks_blocker_user_id ON user_blocks(blocker_user_id);
CREATE INDEX IF NOT EXISTS user_blocks_blocked_user_id ON user_blocks(blocked_user_id);

-- Create user_devices table
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
