/**
 * Discover Repository
 * All database operations for Discover screen (Today Edition + Explore Pool)
 */

import { execSql, execSqlRows } from '../client';
import type { Edition, Story, EditionStory, UserStoryState, CategoryPreference } from '@/types/discover';

export class DiscoverRepo {
  // ========== Editions ==========
  async upsertEdition(e: Edition) {
    await execSql(
      `INSERT OR REPLACE INTO editions
       (edition_id, date_local, timezone, published_at, cutoff_at, mode, version)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [e.editionId, e.dateLocal, e.timezone, e.publishedAt, e.cutoffAt, e.mode, e.version]
    );
  }

  async getEdition(editionId: string): Promise<Edition | null> {
    const rows = await execSqlRows<Edition>(
      `SELECT * FROM editions WHERE edition_id = ? LIMIT 1`,
      [editionId]
    );
    return rows[0] || null;
  }

  // ========== Stories ==========
  async upsertStories(stories: Story[]) {
    for (const s of stories) {
      await execSql(
        `INSERT OR REPLACE INTO stories
         (story_id, canonical_key, title, summary, image_url, category, importance,
          source_name, source_url, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.storyId,
          s.canonicalKey,
          s.title,
          s.summary,
          s.imageUrl ?? null,
          s.category,
          s.importance,
          s.sourceName ?? null,
          s.sourceUrl ?? null,
          s.publishedAt,
          Date.now(),
        ]
      );
    }
  }

  async getStory(storyId: string): Promise<Story | null> {
    const rows = await execSqlRows<Story>(
      `SELECT * FROM stories WHERE story_id = ? LIMIT 1`,
      [storyId]
    );
    return rows[0] || null;
  }

  // ========== Edition Stories (Today Membership) ==========
  async upsertEditionStories(editionId: string, memberships: EditionStory[]) {
    for (const es of memberships) {
      await execSql(
        `INSERT OR REPLACE INTO edition_stories
         (edition_id, story_id, rank, added_at, reason, update_count, last_updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          editionId,
          es.storyId,
          es.rank,
          es.addedAt,
          es.reason,
          es.updateCount,
          es.lastUpdatedAt,
        ]
      );
    }
  }

  async getHeroStack(userId: string, editionId: string) {
    return execSqlRows<Story & { rank: number; reason: string; updateCount: number; status: string }>(
      `SELECT s.*, es.rank, es.reason, es.update_count, us.status
       FROM edition_stories es
       JOIN stories s ON s.story_id = es.story_id
       LEFT JOIN user_story_state us ON us.story_id = s.story_id AND us.user_id = ?
       WHERE es.edition_id = ?
       AND (us.status IS NULL OR us.status NOT IN ('read', 'dismissed'))
       ORDER BY es.rank ASC`,
      [userId, editionId]
    );
  }

  async getUnreadCount(userId: string, editionId: string): Promise<number> {
    const rows = await execSqlRows<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM edition_stories es
       LEFT JOIN user_story_state us ON us.story_id = es.story_id AND us.user_id = ?
       WHERE es.edition_id = ?
       AND (us.status IS NULL OR us.status NOT IN ('read', 'dismissed'))`,
      [userId, editionId]
    );
    return rows[0]?.count ?? 0;
  }

  // ========== User Story State ==========
  async ensureUserStateForToday(userId: string, editionId: string, storyIds: string[]) {
    for (const storyId of storyIds) {
      const existing = await execSqlRows<{ story_id: string; edition_id: string | null }>(
        `SELECT story_id, edition_id FROM user_story_state WHERE user_id=? AND story_id=? LIMIT 1`,
        [userId, storyId]
      );

      if (existing.length === 0) {
        await execSql(
          `INSERT INTO user_story_state
           (user_id, story_id, edition_id, status, delivered_at)
           VALUES (?, ?, ?, 'unseen', ?)`,
          [userId, storyId, editionId, Date.now()]
        );
      } else if (!existing[0].edition_id) {
        await execSql(
          `UPDATE user_story_state SET edition_id=? WHERE user_id=? AND story_id=?`,
          [editionId, userId, storyId]
        );
      }
    }
  }

  async updateStoryState(
    userId: string,
    storyId: string,
    status: 'seen' | 'read' | 'saved' | 'dismissed',
    dismissedScope?: 'today_only' | 'global'
  ) {
    const now = Date.now();
    const updates: string[] = [];
    const params: any[] = [];

    updates.push(`status = ?`);
    params.push(status);

    if (status === 'seen' && !updates.includes('seen_at')) {
      updates.push(`seen_at = ?`);
      params.push(now);
    }
    if (status === 'read' && !updates.includes('read_at')) {
      updates.push(`read_at = ?`);
      params.push(now);
    }
    if (status === 'saved' && !updates.includes('saved_at')) {
      updates.push(`saved_at = ?`);
      params.push(now);
    }
    if (status === 'dismissed' && !updates.includes('dismissed_at')) {
      updates.push(`dismissed_at = ?`);
      params.push(now);
      if (dismissedScope) {
        updates.push(`dismissed_scope = ?`);
        params.push(dismissedScope);
      }
    }

    params.push(userId, storyId);

    await execSql(
      `UPDATE user_story_state SET ${updates.join(', ')} WHERE user_id=? AND story_id=?`,
      params
    );
  }

  // ========== Explore Items ==========
  async refreshExploreCache(sections: Array<{ categoryId: string; items: Story[] }>) {
    // Clear old items
    await execSql(`DELETE FROM explore_items`);

    // Insert new items
    for (const section of sections) {
      for (let i = 0; i < section.items.length; i++) {
        const item = section.items[i];
        await execSql(
          `INSERT INTO explore_items
           (explore_id, story_id, category, score, fetched_at, source)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            `${section.categoryId}-${item.storyId}`,
            item.storyId,
            section.categoryId,
            100 - i, // Simple ranking
            Date.now(),
            'recent',
          ]
        );
      }
    }
  }

  async getExploreRail(categoryId: string, limit: number = 20) {
    return execSqlRows<Story & { score: number }>(
      `SELECT s.*, ei.score
       FROM explore_items ei
       JOIN stories s ON s.story_id = ei.story_id
       WHERE ei.category = ?
       ORDER BY ei.score DESC
       LIMIT ?`,
      [categoryId, limit]
    );
  }

  // ========== Preferences ==========
  async upsertPreferences(userId: string, preferences: CategoryPreference[]) {
    for (const p of preferences) {
      await execSql(
        `INSERT OR REPLACE INTO category_preferences
         (user_id, category_id, enabled, manual_order, lock_order)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, p.categoryId, p.enabled ? 1 : 0, p.manualOrder, p.lockOrder ? 1 : 0]
      );
    }
  }

  async getPreferences(userId: string): Promise<CategoryPreference[]> {
    const rows = await execSqlRows<{ category_id: string; enabled: number; manual_order: number; lock_order: number }>(
      `SELECT category_id, enabled, manual_order, lock_order
       FROM category_preferences
       WHERE user_id = ?
       ORDER BY manual_order ASC`,
      [userId]
    );
    return rows.map(r => ({
      categoryId: r.category_id,
      enabled: r.enabled === 1,
      manualOrder: r.manual_order,
      lockOrder: r.lock_order === 1,
    }));
  }

  // ========== Sync State ==========
  async setSyncState(userId: string, state: { lastSyncedAt: number; currentEditionId: string; currentEditionVersion: number }) {
    await execSql(
      `INSERT OR REPLACE INTO sync_state
       (user_id, last_synced_at, current_edition_id, current_edition_version)
       VALUES (?, ?, ?, ?)`,
      [userId, state.lastSyncedAt, state.currentEditionId, state.currentEditionVersion]
    );
  }

  async getSyncState(userId: string) {
    const rows = await execSqlRows<{ last_synced_at: number; current_edition_id: string; current_edition_version: number }>(
      `SELECT last_synced_at, current_edition_id, current_edition_version
       FROM sync_state
       WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    return rows[0] ? {
      lastSyncedAt: rows[0].last_synced_at,
      currentEditionId: rows[0].current_edition_id,
      currentEditionVersion: rows[0].current_edition_version,
    } : null;
  }

  // ========== Background Inbox ==========
  async getBackgroundInboxCount(userId: string): Promise<number> {
    const rows = await execSqlRows<{ count: number }>(
      `SELECT COUNT(*) as count FROM background_inbox`,
      []
    );
    return rows[0]?.count ?? 0;
  }

  async clearBackgroundInbox(userId: string) {
    await execSql(`DELETE FROM background_inbox`);
  }
}
