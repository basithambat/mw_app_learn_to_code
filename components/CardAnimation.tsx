import React, { useCallback, useMemo } from 'react';
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
  Extrapolate,
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

  // Emil Kowalski's recommended spring configs for card animations
  const springConfigSnappy = useMemo(() => ({
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  }), []);

  const springConfigBouncy = useMemo(() => ({
    damping: 15,
    stiffness: 350,
    mass: 0.5,
  }), []);

  // Deterministic random generator based on seed (id)
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const getRotationValues = (id: number) => {
    // Generate a random rotation between -6 and 6 degrees
    // Use card ID as seed so it's consistent for the same card
    const randomSeed = pseudoRandom(id * 9999);
    const angle = (randomSeed * 12) - 6;

    // For the first card (active), we use standard interaction values
    // For resting cards, we use the random angle
    return { first: [-15, 0, 15], rest: [angle, 0, -angle / 2] };
  };

  const rotationValues = getRotationValues(card.id);

  const removeCard = useCallback((direction: 'left' | 'right') => {
    'worklet';
    runOnJS(onSwipe)(direction);
  }, [onSwipe]);

  const handlePress = useCallback(() => {
    'worklet';
    runOnJS(onPress)();
  }, [onPress]);

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
          const distanceThreshold = SCREEN_WIDTH * 0.35; // Slightly lower for better UX

          // Emil's pattern: Use velocity for more natural feel
          if (Math.abs(velocityX) > velocityThreshold || Math.abs(translateX.value) > distanceThreshold) {
            const direction = translateX.value > 0 ? 'right' : 'left';
            // Use velocity-aware spring for natural exit animation
            translateX.value = withSpring(
              Math.sign(translateX.value) * SCREEN_WIDTH * 1.2, // Slight overshoot for natural feel
              velocityX && Math.abs(velocityX) > velocityThreshold
                ? springConfigBouncy
                : springConfigSnappy
            );
            removeCard(direction);
          } else {
            // Spring back with snappy config
            translateX.value = withSpring(0, springConfigSnappy);
          }
        }
      });

    const tap = Gesture.Tap()
      .onEnd(() => {
        if (isFirst && Math.abs(translateX.value) < 5) {
          // Only trigger tap if card hasn't moved much (not a swipe)
          handlePress();
        }
      });

    return Gesture.Race(pan, tap);
  }, [isFirst, translateX, removeCard, SCREEN_WIDTH, handlePress]);

  // Pre-calculate static transform values to avoid recalculating on every frame
  const staticTranslateY = useMemo(() => index * 1, [index]);
  const staticTranslateX = useMemo(() => index * 20, [index]);
  const staticOpacity = useMemo(() => {
    // Calculate opacity based on index position
    const maxIndex = Math.min(totalCards - 1, 3);
    if (index <= 1) return 1;
    if (index >= maxIndex) return 0.5;
    // Linear interpolation between 1 and 0.5
    return 1 - ((index - 1) / (maxIndex - 1)) * 0.5;
  }, [index, totalCards]);

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

    // Emil's pattern: Smoother rotation interpolation
    const rotate = interpolate(
      isFirst ? translateX.value : activeIndex.value,
      isFirst ? [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2] : [index - 1, index, index + 1],
      isFirst ? rotationValues.first : rotationValues.rest,
      Extrapolate.CLAMP
    );

    if (!isFirst) {
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
  }, [isFirst, index, activeIndex, translateX, SCREEN_WIDTH, rotationValues, staticTranslateY, staticTranslateX, staticOpacity]);

  // Emil's pattern: Enhanced parallax effect with smoother interpolation
  const animatedImageStyle = useAnimatedStyle(() => {
    'worklet';
    if (!isFirst) return {};

    // Emil's pattern: Use Extrapolate.CLAMP for better performance
    const parallaxX = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-30, 0, 30], // Shift image 30px opposite to movement for depth
      Extrapolate.CLAMP
    );

    // Add subtle scale for depth effect (Emil's pattern)
    const parallaxScale = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH / 2],
      [1, 1.05],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: parallaxX },
        { scale: parallaxScale }
      ]
    };
  }, [isFirst, translateX, SCREEN_WIDTH]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }, animatedCardStyle]}>
        {card.image ? (
          <Animated.Image source={{ uri: card.image }} style={[styles.cardImage, animatedImageStyle]} />
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