/**
 * SQLite Database Client
 * Uses expo-sqlite v16 async API for React Native
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('whatsay.db');
    if (!initPromise) {
      initPromise = initializeDatabase();
    }
    await initPromise;
  }
  return db;
}

async function initializeDatabase() {
  if (!db) return;
  await executeSchemaInline();
}

async function executeSchemaInline() {
  if (!db) return;

  // Execute all schema statements
  const schema = `
    -- Editions
    CREATE TABLE IF NOT EXISTS editions (
      edition_id TEXT PRIMARY KEY,
      date_local TEXT NOT NULL,
      timezone TEXT NOT NULL,
      published_at INTEGER NOT NULL,
      cutoff_at INTEGER NOT NULL,
      mode TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );

    -- Stories
    CREATE TABLE IF NOT EXISTS stories (
      story_id TEXT PRIMARY KEY,
      canonical_key TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      image_url TEXT,
      category TEXT NOT NULL,
      importance INTEGER NOT NULL,
      source_name TEXT,
      source_url TEXT,
      published_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    );

    -- Edition Stories
    CREATE TABLE IF NOT EXISTS edition_stories (
      edition_id TEXT NOT NULL,
      story_id TEXT NOT NULL,
      rank INTEGER NOT NULL,
      added_at INTEGER NOT NULL,
      reason TEXT NOT NULL,
      update_count INTEGER NOT NULL DEFAULT 0,
      last_updated_at INTEGER NOT NULL,
      PRIMARY KEY (edition_id, story_id)
    );

    -- Explore Items
    CREATE TABLE IF NOT EXISTS explore_items (
      explore_id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL,
      category TEXT NOT NULL,
      score REAL NOT NULL,
      fetched_at INTEGER NOT NULL,
      source TEXT NOT NULL
    );

    -- User Story State
    CREATE TABLE IF NOT EXISTS user_story_state (
      user_id TEXT NOT NULL,
      story_id TEXT NOT NULL,
      edition_id TEXT,
      status TEXT NOT NULL,
      delivered_at INTEGER,
      seen_at INTEGER,
      read_at INTEGER,
      saved_at INTEGER,
      dismissed_at INTEGER,
      dismissed_scope TEXT,
      PRIMARY KEY (user_id, story_id)
    );

    -- Category Preferences
    CREATE TABLE IF NOT EXISTS category_preferences (
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      manual_order INTEGER NOT NULL,
      lock_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, category_id)
    );

    -- Category Signals
    CREATE TABLE IF NOT EXISTS category_signals (
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      auto_score REAL NOT NULL DEFAULT 0,
      last_updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, category_id)
    );

    -- Background Inbox
    CREATE TABLE IF NOT EXISTS background_inbox (
      inbox_id TEXT PRIMARY KEY,
      edition_id TEXT,
      story_id TEXT,
      type TEXT NOT NULL,
      received_at INTEGER NOT NULL,
      payload_json TEXT NOT NULL
    );

    -- Sync State
    CREATE TABLE IF NOT EXISTS sync_state (
      user_id TEXT PRIMARY KEY,
      last_synced_at INTEGER NOT NULL DEFAULT 0,
      current_edition_id TEXT,
      current_edition_version INTEGER NOT NULL DEFAULT 0
    );

    -- Section Order
    CREATE TABLE IF NOT EXISTS section_order (
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      final_order INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, category_id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_editions_date_local ON editions(date_local);
    CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
    CREATE INDEX IF NOT EXISTS idx_edition_stories_rank ON edition_stories(edition_id, rank);
    CREATE INDEX IF NOT EXISTS idx_explore_items_category ON explore_items(category, score DESC);
    CREATE INDEX IF NOT EXISTS idx_user_story_state_edition ON user_story_state(user_id, edition_id, status);
    CREATE INDEX IF NOT EXISTS idx_category_preferences_order ON category_preferences(user_id, manual_order);
  `;

  await db.execAsync(schema);
}

export async function execSql(sql: string, params: any[] = []): Promise<void> {
  const database = await getDatabase();
  const stmt = await database.prepareAsync(sql);
  try {
    await stmt.executeAsync(params);
  } finally {
    await stmt.finalizeAsync();
  }
}

export async function execSqlRows<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const database = await getDatabase();
  const stmt = await database.prepareAsync(sql);
  try {
    const result = await stmt.executeAsync<T>(params);
    // Use getAllAsync() to get all rows at once
    return await result.getAllAsync();
  } finally {
    await stmt.finalizeAsync();
  }
}
