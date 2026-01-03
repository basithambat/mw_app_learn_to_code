/**
 * Bootstrap Sync
 * Initial load of Today Edition + Explore Pool
 */

import { DiscoverRepo } from '@/db/repo/DiscoverRepo';
import { DiscoverApi } from '@/api/apiDiscover';
import type { Edition, Story, EditionStory, CategoryPreference, CategoryRankingSignal } from '@/types/discover';

export async function bootstrapDiscover({
  userId,
  timezone,
}: {
  userId: string;
  timezone: string;
}) {
  const repo = new DiscoverRepo();

  // Call API
  const res = await DiscoverApi.bootstrap(timezone, userId);

  // Store in local DB
  await repo.upsertEdition(res.edition);
  await repo.upsertStories(res.today.stories);
  await repo.upsertEditionStories(res.edition.editionId, res.today.editionStories);
  await repo.ensureUserStateForToday(
    userId,
    res.edition.editionId,
    res.today.editionStories.map(es => es.storyId)
  );

  // Refresh Explore cache
  await repo.refreshExploreCache(res.explore.sections);

  // Store preferences
  await repo.upsertPreferences(userId, res.preferences);

  // Store category signals
  for (const signal of res.categorySignals) {
    // TODO: Implement category signals storage if needed
  }

  // Update sync state
  await repo.setSyncState(userId, {
    lastSyncedAt: res.serverTime,
    currentEditionId: res.edition.editionId,
    currentEditionVersion: res.edition.version,
  });

  return {
    editionId: res.edition.editionId,
    serverTime: res.serverTime,
  };
}
