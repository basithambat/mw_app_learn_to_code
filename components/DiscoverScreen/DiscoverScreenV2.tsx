/**
 * Discover Screen V2 - Better Inshorts
 * Today Edition (Hero Stack) + Explore Pool (Category Rails)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import { HeroStack } from './HeroStack';
import { UnreadPill } from './UnreadPill';
import { UpdatesBanner } from './UpdatesBanner';
import { CategoryRail } from './CategoryRail';
import { bootstrapDiscover } from '@/sync/bootstrap';
import { refreshDiscover } from '@/sync/refresh';
import { DiscoverRepo } from '@/db/repo/DiscoverRepo';
import { useStoryViewability } from '@/hooks/useStoryViewability';
import type { Story, ExploreSection } from '@/types/discover';

export function DiscoverScreenV2() {
  const userId = useSelector(loggedInUserDataSelector)?.user?.id || 'anonymous';
  const timezone = 'Asia/Kolkata';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [heroItems, setHeroItems] = useState<Array<Story & { rank: number; reason: string; status: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [exploreSections, setExploreSections] = useState<ExploreSection[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [backgroundInboxCount, setBackgroundInboxCount] = useState(0);

  const activeIndex = useSharedValue(0);
  const translateX = useSharedValue(0);
  const repo = new DiscoverRepo();

  // Viewability tracking
  const handleSeen = useCallback(
    async (storyId: string) => {
      await repo.updateStoryState(userId, storyId, 'seen');
      // Refresh unread count
      if (editionId) {
        const count = await repo.getUnreadCount(userId, editionId);
        setUnreadCount(count);
      }
    },
    [userId, editionId, repo]
  );

  const handleRead = useCallback(
    async (storyId: string, method: 'dwell' | 'tap') => {
      await repo.updateStoryState(userId, storyId, 'read');
      // Refresh hero items and unread count
      if (editionId) {
        const hero = await repo.getHeroStack(userId, editionId);
        setHeroItems(hero);
        const count = await repo.getUnreadCount(userId, editionId);
        setUnreadCount(count);
      }
    },
    [userId, editionId, repo]
  );

  const { viewabilityConfig, onViewableItemsChanged } = useStoryViewability({
    onSeen: handleSeen,
    onRead: handleRead,
  });

  // Bootstrap on mount
  useEffect(() => {
    loadDiscover();
  }, []);

  const loadDiscover = async () => {
    try {
      setLoading(true);
      const result = await bootstrapDiscover({ userId, timezone });
      setEditionId(result.editionId);

      // Load hero stack
      const hero = await repo.getHeroStack(userId, result.editionId);
      setHeroItems(hero);

      // Load unread count
      const unread = await repo.getUnreadCount(userId, result.editionId);
      setUnreadCount(unread);

      // Load explore sections
      const preferences = await repo.getPreferences(userId);
      const categoryIds = preferences.filter(p => p.enabled).map(p => p.categoryId);
      const sections: ExploreSection[] = [];
      for (const catId of categoryIds) {
        const items = await repo.getExploreRail(catId);
        sections.push({ categoryId: catId, items });
      }
      setExploreSections(sections);
      setSectionOrder(categoryIds);

      // Check background inbox
      const inboxCount = await repo.getBackgroundInboxCount(userId);
      setBackgroundInboxCount(inboxCount);
    } catch (error) {
      console.error('[DiscoverScreen] Bootstrap error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!editionId) return;

    setRefreshing(true);
    try {
      const syncState = await repo.getSyncState(userId);
      if (syncState) {
        await refreshDiscover({
          userId,
          editionId: syncState.currentEditionId,
          since: syncState.lastSyncedAt,
          version: syncState.currentEditionVersion,
        });

        // Reload data
        const hero = await repo.getHeroStack(userId, editionId);
        setHeroItems(hero);
        const unread = await repo.getUnreadCount(userId, editionId);
        setUnreadCount(unread);

        // Reload explore
        const preferences = await repo.getPreferences(userId);
        const categoryIds = preferences.filter(p => p.enabled).map(p => p.categoryId);
        const sections: ExploreSection[] = [];
        for (const catId of categoryIds) {
          const items = await repo.getExploreRail(catId);
          sections.push({ categoryId: catId, items });
        }
        setExploreSections(sections);
        setSectionOrder(categoryIds);

        // Clear inbox
        setBackgroundInboxCount(0);
      }
    } catch (error) {
      console.error('[DiscoverScreen] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSwipe = useCallback(
    async (story: Story, direction: 'left' | 'right') => {
      if (direction === 'right') {
        // Save
        await repo.updateStoryState(userId, story.storyId, 'saved');
      } else {
        // Dismiss (today_only scope for Today Edition items)
        const scope = story.category === 'today' ? 'today_only' : 'global';
        await repo.updateStoryState(userId, story.storyId, 'dismissed', scope);
      }

      // Refresh hero items
      if (editionId) {
        const hero = await repo.getHeroStack(userId, editionId);
        setHeroItems(hero);
        const count = await repo.getUnreadCount(userId, editionId);
        setUnreadCount(count);
      }
    },
    [userId, editionId, repo]
  );

  const handleItemPress = useCallback((story: Story) => {
    // Mark as read on tap
    handleRead(story.storyId, 'tap');
    // TODO: Navigate to detail screen
  }, [handleRead]);

  const isInToday = useCallback(
    (storyId: string) => {
      return heroItems.some(item => item.storyId === storyId);
    },
    [heroItems]
  );

  const handleUnreadPillPress = () => {
    // TODO: Open Consume Mode
    console.log('Open Consume Mode');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Order sections by sectionOrder
  const orderedSections = [...exploreSections].sort((a, b) => {
    const aIndex = sectionOrder.indexOf(a.categoryId);
    const bIndex = sectionOrder.indexOf(b.categoryId);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <View style={styles.container}>
      <UpdatesBanner
        count={backgroundInboxCount}
        onPress={onRefresh}
        visible={backgroundInboxCount > 0}
      />

      <FlatList
        data={orderedSections}
        keyExtractor={(item) => item.categoryId}
        ListHeaderComponent={
          <View>
            <HeroStack
              items={heroItems}
              activeIndex={activeIndex}
              translateX={translateX}
              onSwipe={handleSwipe}
              onPress={handleItemPress}
            />
          </View>
        }
        renderItem={({ item }) => (
          <CategoryRail
            categoryId={item.categoryId}
            categoryName={item.categoryId.charAt(0).toUpperCase() + item.categoryId.slice(1)}
            items={item.items}
            onItemPress={handleItemPress}
            onSwipe={handleSwipe}
            isInToday={isInToday}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      <UnreadPill count={unreadCount} onPress={handleUnreadPillPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
});
