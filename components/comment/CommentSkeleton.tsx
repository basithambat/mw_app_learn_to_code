/**
 * Comment Skeleton Loader
 * Shows loading placeholders with a subtle shimmer animation
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Shimmer: React.FC<{ width: number | string; height: number; borderRadius?: number; style?: any }> = ({
  width,
  height,
  borderRadius = 4,
  style
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.shimmerBase, { width, height, borderRadius }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const CommentSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shimmer width={36} height={36} borderRadius={18} style={styles.avatar} />
        <View style={styles.headerContent}>
          <Shimmer width="40%" height={12} style={styles.nameLine} />
          <Shimmer width="20%" height={10} style={styles.badgeLine} />
        </View>
      </View>
      <View style={styles.body}>
        <Shimmer width="90%" height={14} style={styles.bodyLine} />
        <Shimmer width="80%" height={14} style={styles.bodyLine} />
        <Shimmer width="60%" height={14} style={styles.bodyLine} />
      </View>
      <View style={styles.actions}>
        <Shimmer width={50} height={16} style={styles.actionButton} />
        <Shimmer width={50} height={16} style={styles.actionButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7', // Subtler border
  },
  shimmerBase: {
    backgroundColor: '#EBEBEB', // More refined base color
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  nameLine: {
    marginBottom: 6,
  },
  badgeLine: {
  },
  body: {
    marginBottom: 16,
  },
  bodyLine: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
  },
});
