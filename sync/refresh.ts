/**
 * Refresh Sync
 * Pull-to-refresh with delta updates
 */

import { DiscoverRepo } from '@/db/repo/DiscoverRepo';
import { DiscoverApi } from '@/api/apiDiscover';

export async function refreshDiscover(params: {
  userId: string;
  editionId: string;
  since: number;
  version: number;
}) {
  const repo = new DiscoverRepo();

  // Call API
  const res = await DiscoverApi.refresh(params.editionId, params.since, params.version, params.userId);

  // Handle Today additions
  if (res.today.added.stories.length > 0) {
    await repo.upsertStories(res.today.added.stories);
    await repo.upsertEditionStories(params.editionId, res.today.added.editionStories);
    await repo.ensureUserStateForToday(
      params.userId,
      params.editionId,
      res.today.added.editionStories.map(es => es.storyId)
    );
  }

  // Handle Today updates
  if (res.today.updated.stories.length > 0) {
    await repo.upsertStories(res.today.updated.stories);
    await repo.upsertEditionStories(params.editionId, res.today.updated.editionStories);
  }

  // Handle removals (mark as removed, don't delete)
  // TODO: Implement removal handling if needed

  // Refresh Explore cache
  await repo.refreshExploreCache(res.explore.sections);

  // Clear background inbox
  await repo.clearBackgroundInbox(params.userId);

  // Update sync state
  await repo.setSyncState(params.userId, {
    lastSyncedAt: res.serverTime,
    currentEditionId: params.editionId,
    currentEditionVersion: res.editionVersion,
  });

  return {
    editionVersion: res.editionVersion,
    serverTime: res.serverTime,
  };
}
