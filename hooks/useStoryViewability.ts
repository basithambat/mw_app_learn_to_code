/**
 * Story Viewability Hook
 * Tracks seen/read states using FlatList viewability
 */

import { useRef, useCallback } from 'react';
import type { ViewToken } from 'react-native';

type Args = {
  onSeen: (storyId: string) => void;
  onRead: (storyId: string, method: 'dwell' | 'tap') => void;
};

const SEEN_THRESHOLD = 60; // 60% visible
const SEEN_MIN_TIME = 500; // 500ms
const READ_DWELL_TIME = 2500; // 2.5 seconds

export function useStoryViewability({ onSeen, onRead }: Args) {
  const seen = useRef(new Set<string>());
  const dwellTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const seenTimestamps = useRef<Record<string, number>>({});

  const viewabilityConfig = {
    itemVisiblePercentThreshold: SEEN_THRESHOLD,
    minimumViewTime: SEEN_MIN_TIME,
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const now = Date.now();

      for (const v of viewableItems) {
        const id = v.item?.storyId || v.item?.id;
        if (!id) continue;

        // Track visibility time for "seen"
        if (!seenTimestamps.current[id]) {
          seenTimestamps.current[id] = now;
        }

        const visibleTime = now - seenTimestamps.current[id];

        // Mark as "seen" if visible for minimum time
        if (!seen.current.has(id) && visibleTime >= SEEN_MIN_TIME) {
          seen.current.add(id);
          onSeen(id);
        }

        // Start dwell timer for "read" (2.5s)
        if (!dwellTimers.current[id] && visibleTime >= SEEN_MIN_TIME) {
          dwellTimers.current[id] = setTimeout(() => {
            onRead(id, 'dwell');
            if (dwellTimers.current[id]) {
              clearTimeout(dwellTimers.current[id]);
              delete dwellTimers.current[id];
            }
          }, READ_DWELL_TIME - visibleTime);
        }
      }

      // Clear timers for items no longer visible
      const visibleIds = new Set(viewableItems.map(v => v.item?.storyId || v.item?.id).filter(Boolean));
      for (const id in dwellTimers.current) {
        if (!visibleIds.has(id)) {
          clearTimeout(dwellTimers.current[id]);
          delete dwellTimers.current[id];
          delete seenTimestamps.current[id];
        }
      }
    },
    [onSeen, onRead]
  );

  const clearDwellTimers = useCallback(() => {
    for (const id in dwellTimers.current) {
      clearTimeout(dwellTimers.current[id]);
    }
    dwellTimers.current = {};
    seenTimestamps.current = {};
  }, []);

  return {
    viewabilityConfig,
    onViewableItemsChanged,
    clearDwellTimers,
  };
}
