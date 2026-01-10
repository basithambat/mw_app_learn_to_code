/**
 * Hero Stack Component
 * Today Edition card stack with swipe gestures
 */

import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import type { Story } from '@/types/discover';
import { getImageUrlWithFallback } from '@/utils/categoryFallbackImages';

interface HeroStackProps {
  items: Array<Story & { rank: number; reason: string; status: string }>;
  activeIndex: SharedValue<number>;
  translateX: SharedValue<number>;
  onSwipe: (story: Story, direction: 'left' | 'right') => void;
  onPress: (story: Story) => void;
}

export const HeroStack: React.FC<HeroStackProps> = ({
  items,
  activeIndex,
  translateX,
  onSwipe,
  onPress,
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CARD_WIDTH = SCREEN_WIDTH * 0.75;
  const CARD_HEIGHT = CARD_WIDTH * (320 / 273);
  const visibleItems = items.slice(0, 3); // Show top 3 cards

  const removeCard = useCallback(
    (story: Story, direction: 'left' | 'right') => {
      'worklet';
      runOnJS(onSwipe)(story, direction);
    },
    [onSwipe]
  );

  return (
    <View style={[styles.container, { height: CARD_HEIGHT + 100 }]}>
      {visibleItems.map((item, index) => {
        const isFirst = index === 0;

        const handlePress = useCallback(() => {
          'worklet';
          runOnJS(onPress)(item);
        }, [onPress, item]);

        const panGesture = useMemo(() => {
          const pan = Gesture.Pan()
            .activeOffsetX([-10, 10])
            .failOffsetY([-10, 10])
            .onUpdate((event) => {
              if (isFirst) {
                translateX.value = event.translationX;
              }
            })
            .onEnd((event) => {
              'worklet';
              if (isFirst) {
                const { velocityX } = event;
                const velocityThreshold = 500; // Emil's pattern: velocity-based decisions
                const distanceThreshold = SCREEN_WIDTH * 0.35;
                
                // Emil's pattern: Use velocity for more natural feel
                if (Math.abs(velocityX) > velocityThreshold || Math.abs(translateX.value) > distanceThreshold) {
                  const direction = translateX.value > 0 ? 'right' : 'left';
                  // Use velocity-aware spring
                  translateX.value = withSpring(
                    Math.sign(translateX.value) * SCREEN_WIDTH * 1.2,
                    Math.abs(velocityX) > velocityThreshold
                      ? { damping: 15, stiffness: 350, mass: 0.5 } // Bouncy for fast swipes
                      : { damping: 20, stiffness: 300, mass: 0.8 } // Snappy for slow swipes
                  );
                  removeCard(item, direction);
                } else {
                  translateX.value = withSpring(0, {
                    damping: 20,
                    stiffness: 300,
                    mass: 0.8,
                  });
                }
              }
            });

          const tap = Gesture.Tap()
            .onEnd(() => {
              if (isFirst && Math.abs(translateX.value) < 5) {
                handlePress();
              }
            });

          return Gesture.Race(pan, tap);
        }, [isFirst, translateX, removeCard, item, SCREEN_WIDTH, handlePress]);

        const animatedCardStyle = useAnimatedStyle(() => {
          'worklet';
          // Emil's pattern: Use Extrapolate.CLAMP for better performance
          const scale = interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [0.95, 1, 1.05],
            Extrapolate.CLAMP
          );

          const translateY = interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [-18, 0, 0],
            Extrapolate.CLAMP
          );

          const rotate = interpolate(
            isFirst ? translateX.value : activeIndex.value,
            isFirst ? [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2] : [index - 1, index, index + 1],
            isFirst ? [-10, 0, 10] : [3, 0, -3],
            Extrapolate.CLAMP
          );

          if (!isFirst) {
            const staticTranslateY = index * 1;
            const staticTranslateX = index * 20;
            const maxIndex = Math.min(visibleItems.length - 1, 3);
            const staticOpacity = index <= 1 ? 1 : index >= maxIndex ? 0.5 : 1 - ((index - 1) / (maxIndex - 1)) * 0.5;
            
            return {
              transform: [
                { scale },
                { translateY: translateY + staticTranslateY },
                { rotate: `${rotate}deg` },
                { translateX: staticTranslateX },
              ],
              opacity: staticOpacity,
            };
          }

          return {
            transform: [
              { translateX: translateX.value },
              { rotate: `${rotate}deg` },
            ],
          };
        });

        const imageUrl = getImageUrlWithFallback(item.imageUrl, item.category);

        return (
          <GestureDetector key={item.storyId} gesture={panGesture}>
            <Animated.View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }, animatedCardStyle]}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.placeholder]}>
                    <Text style={styles.placeholderText}>No Image</Text>
                  </View>
                )}
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                  style={styles.gradient}
                >
                  <View style={StyleSheet.absoluteFill} />
                </LinearGradient>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </Animated.View>
          </GestureDetector>
        );
      }).reverse()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    overflow: 'visible',
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    backgroundColor: 'white',
    position: 'absolute',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  cardTitle: {
    fontFamily: 'Domine',
    fontSize: 18,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    position: 'absolute',
    bottom: 24,
    paddingHorizontal: 16,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
});
