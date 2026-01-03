/**
 * Category Rail Component
 * Explore Pool category section
 */

import React from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { Card } from '../CardAnimation';
import { useSharedValue } from 'react-native-reanimated';
import type { Story } from '@/types/discover';
import { getImageUrlWithFallback } from '@/utils/categoryFallbackImages';

interface CategoryRailProps {
  categoryId: string;
  categoryName: string;
  items: Story[];
  onItemPress: (story: Story) => void;
  onSwipe: (story: Story, direction: 'left' | 'right') => void;
  isInToday?: (storyId: string) => boolean;
}

export const CategoryRail: React.FC<CategoryRailProps> = ({
  categoryId,
  categoryName,
  items,
  onItemPress,
  onSwipe,
  isInToday,
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isTablet = SCREEN_WIDTH >= 768;
  const activeIndex = useSharedValue(0);
  const translateX = useSharedValue(0);

  const visibleItems = items.slice(0, isTablet ? 4 : 3);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingLeft: isTablet ? 32 : 16 }]}>
        <Text style={[styles.title, { fontSize: isTablet ? 24 : 20 }]}>{categoryName}</Text>
      </View>

      <View style={styles.cardsContainer}>
        {visibleItems.map((item, index) => {
          const imageUrl = getImageUrlWithFallback(item.imageUrl, item.category);
          const inToday = isInToday?.(item.storyId);

          return (
            <View key={item.storyId} style={styles.cardWrapper}>
              {inToday && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>In Today</Text>
                </View>
              )}
              <Card
                card={{
                  id: parseInt(item.storyId.slice(0, 8), 16) || 0,
                  title: item.title,
                  image: imageUrl,
                }}
                index={index}
                totalCards={visibleItems.length}
                activeIndex={activeIndex}
                translateX={translateX}
                onSwipe={(direction) => onSwipe(item, direction)}
                onPress={() => onItemPress(item)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Domine',
    fontSize: 20,
    fontWeight: '600',
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  cardWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});
