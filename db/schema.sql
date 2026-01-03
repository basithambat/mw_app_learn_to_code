-- ========== Better Inshorts: Local SQLite Schema ==========
-- This schema matches the spec exactly for local-first architecture

-- ========== editions ==========
CREATE TABLE IF NOT EXISTS editions (
  edition_id TEXT PRIMARY KEY,          -- "YYYY-MM-DD"
  date_local TEXT NOT NULL,             -- "YYYY-MM-DD"
  timezone TEXT NOT NULL,               -- "Asia/Kolkata"
  published_at INTEGER NOT NULL,        -- epoch ms
  cutoff_at INTEGER NOT NULL,            -- epoch ms
  mode TEXT NOT NULL,                   -- "semi_live" | "fixed"
  version INTEGER NOT NULL DEFAULT 1    -- increments with breaking additions
);

CREATE INDEX IF NOT EXISTS idx_editions_date_local
ON editions(date_local);

-- ========== stories (shared) ==========
CREATE TABLE IF NOT EXISTS stories (
  story_id TEXT PRIMARY KEY,
  canonical_key TEXT NOT NULL,          -- dedupe key
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  importance INTEGER NOT NULL,          -- 0-100
  source_name TEXT,
  source_url TEXT,
  published_at INTEGER NOT NULL,        -- epoch ms
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_canonical_key ON stories(canonical_key);

-- ========== edition_stories (Today membership) ==========
CREATE TABLE IF NOT EXISTS edition_stories (
  edition_id TEXT NOT NULL,
  story_id TEXT NOT NULL,
  rank INTEGER NOT NULL,                -- stable ordering in Today
  added_at INTEGER NOT NULL,
  reason TEXT NOT NULL,                 -- "must_know"|"breaking"|...
  update_count INTEGER NOT NULL DEFAULT 0,
  last_updated_at INTEGER NOT NULL,

  PRIMARY KEY (edition_id, story_id),
  FOREIGN KEY (edition_id) REFERENCES editions(edition_id),
  FOREIGN KEY (story_id) REFERENCES stories(story_id)
);

CREATE INDEX IF NOT EXISTS idx_edition_stories_rank
ON edition_stories(edition_id, rank);

-- ========== explore_items (Explore cache membership) ==========
CREATE TABLE IF NOT EXISTS explore_items (
  explore_id TEXT PRIMARY KEY,          -- unique cache row id
  story_id TEXT NOT NULL,
  category TEXT NOT NULL,
  score REAL NOT NULL,
  fetched_at INTEGER NOT NULL,
  source TEXT NOT NULL,                 -- "trending"|"personalized"|...
  
  FOREIGN KEY (story_id) REFERENCES stories(story_id)
);

CREATE INDEX IF NOT EXISTS idx_explore_items_category
ON explore_items(category, score DESC);

CREATE INDEX IF NOT EXISTS idx_explore_items_fetched_at
ON explore_items(fetched_at);

-- ========== user_story_state ==========
CREATE TABLE IF NOT EXISTS user_story_state (
  user_id TEXT NOT NULL,
  story_id TEXT NOT NULL,

  -- If part of Today Edition, edition_id filled; otherwise NULL.
  edition_id TEXT,

  status TEXT NOT NULL,                 -- "unseen"|"seen"|"read"|"saved"|"dismissed"
  delivered_at INTEGER,
  seen_at INTEGER,
  read_at INTEGER,
  saved_at INTEGER,
  dismissed_at INTEGER,
  dismissed_scope TEXT,                 -- "today_only"|"global" or NULL

  PRIMARY KEY (user_id, story_id),
  FOREIGN KEY (story_id) REFERENCES stories(story_id)
);

CREATE INDEX IF NOT EXISTS idx_user_story_state_edition
ON user_story_state(user_id, edition_id, status);

CREATE INDEX IF NOT EXISTS idx_user_story_state_status
ON user_story_state(user_id, status);

-- ========== preferences ==========
CREATE TABLE IF NOT EXISTS category_preferences (
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,   -- 0/1
  manual_order INTEGER NOT NULL,        -- 1 = top
  lock_order INTEGER NOT NULL DEFAULT 0, -- 0/1
  
  PRIMARY KEY (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_category_preferences_order
ON category_preferences(user_id, manual_order);

-- ========== category signals (algorithm state) ==========
CREATE TABLE IF NOT EXISTS category_signals (
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  auto_score REAL NOT NULL DEFAULT 0,
  last_updated_at INTEGER NOT NULL,

  PRIMARY KEY (user_id, category_id)
);

-- ========== background inbox (push staging) ==========
CREATE TABLE IF NOT EXISTS background_inbox (
  inbox_id TEXT PRIMARY KEY,            -- uuid
  edition_id TEXT,
  story_id TEXT,
  type TEXT NOT NULL,                   -- "today_addition"|"today_update"|"explore_suggestion"
  received_at INTEGER NOT NULL,
  payload_json TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_background_inbox_dedupe
ON background_inbox(edition_id, story_id, type);

-- ========== sync_state ==========
CREATE TABLE IF NOT EXISTS sync_state (
  user_id TEXT PRIMARY KEY,
  last_synced_at INTEGER NOT NULL DEFAULT 0,
  current_edition_id TEXT,
  current_edition_version INTEGER NOT NULL DEFAULT 0
);

-- ========== section order (optional) ==========
CREATE TABLE IF NOT EXISTS section_order (
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  final_order INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, category_id)
);
