import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Image, useWindowDimensions, TouchableOpacity, ViewStyle, ImageStyle, TextStyle } from 'react-native';
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

interface CardProps {
  card: {
    id: number;
    title: string;
    image: any;
  };
  index: number;
  totalCards: number;
  activeIndex: SharedValue<number>;
  translateX: SharedValue<number>;
  onSwipe: (direction: 'left' | 'right') => void;
  onPress: () => void;
  categoryIndex?: number;
}

export const Card: React.FC<CardProps> = ({
  card,
  index,
  totalCards,
  activeIndex,
  translateX,
  onSwipe,
  onPress,
  categoryIndex
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CARD_WIDTH = SCREEN_WIDTH * 0.75;
  const CARD_HEIGHT = CARD_WIDTH * (320 / 273);
  const isFirst = index === 0;

  const getRotationValues = (categoryIdx: number) => {
    switch (categoryIdx) {
      case 0:
        return { first: [-10, 0, 10], rest: [3, 0, 0] };
      case 1:
        return { first: [-10, 0, 10], rest: [-3, 0, 0] };
      case 2:
        return { first: [-10, 0, 10], rest: [0, 0, 0] };
      case 3:
        return { first: [-10, 0, 10], rest: [3, 0, 0] };
      case 4:
        return { first: [-10, 0, 10], rest: [-3, 0, 0] };
      case 5:
        return { first: [-10, 0, 10], rest: [0, 0, 0] };
      default:
        return { first: [-10, 0, 10], rest: [3, 0, -3] };
    }
  };

  const rotationValues = getRotationValues(categoryIndex ? categoryIndex : 0);

  const removeCard = useCallback((direction: 'left' | 'right') => {
    'worklet';
    runOnJS(onSwipe)(direction);
  }, [onSwipe]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (isFirst) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (isFirst) {
        if (Math.abs(event.velocityX) > 400 || Math.abs(translateX.value) > SCREEN_WIDTH * 0.4) {
          translateX.value = withTiming(Math.sign(translateX.value) * SCREEN_WIDTH);
          const direction = translateX.value > 0 ? 'right' : 'left';
          removeCard(direction);
        } else {
          translateX.value = withTiming(0);
        }
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [0.95, 1, 1.05]
    );

    const translateY = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [-18, 0, 0]
    );

    const rotate = interpolate(
      isFirst ? translateX.value : activeIndex.value,
      isFirst ? [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2] : [index - 1, index, index + 1],
      isFirst ? rotationValues.first : rotationValues.rest
    );

    if (!isFirst) {
      return {
        transform: [
          { scale },
          { translateY },
          { rotate: `${rotate}deg` },
          { translateY: withTiming(index * 1, { duration: 300 }) },
          { translateX: withTiming(index * 20, { duration: 300 }) },
        ],
        opacity: interpolate(
          index,
          [1, Math.min(totalCards - 1, 3)],
          [1, 0.5]
        ),
      };
    }

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
        <Animated.View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }, animatedCardStyle]}>
          {card.image ? (
            <Image source={{ uri: card.image }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>No Image</Text>
            </View>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <View style={StyleSheet.absoluteFill} />
          </LinearGradient>
          <Text style={styles.cardTitle}>{card.title}</Text>
        </Animated.View>
      </TouchableOpacity>
    </GestureDetector>
  );
};

type Style = {
  card: ViewStyle;
  cardImage: ImageStyle;
  cardTitle: TextStyle;
  gradient: ViewStyle;
};

const styles = StyleSheet.create<Style>({
  card: {
    borderCurve: "continuous",
    borderRadius: 20,
    backgroundColor: 'white',
    position: 'absolute',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
    alignSelf: 'center'
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontFamily: 'Domine',
    fontSize: 18,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    position: "absolute",
    bottom: 24,
    paddingHorizontal: 16
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  }
});