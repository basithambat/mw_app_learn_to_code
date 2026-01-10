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

  // Airbnb-grade spring configs
  const springConfigSnap = useMemo(() => ({
    damping: 25,
    stiffness: 200,
    mass: 0.5,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  }), []);

  const springConfigSwipe = useMemo(() => ({
    damping: 20,
    stiffness: 150,
    mass: 1,
  }), []);

  const getRotationValues = (id: number, categoryIdx?: number) => {
    if (categoryIdx !== undefined) {
      switch (categoryIdx % 6) {
        case 0:
          return { first: [-15, 0, 15], rest: [3, 0, 0] };
        case 1:
          return { first: [-15, 0, 15], rest: [-3, 0, 0] };
        case 2:
          return { first: [-15, 0, 15], rest: [0, 0, 0] };
        case 3:
          return { first: [-15, 0, 15], rest: [3, 0, 0] };
        case 4:
          return { first: [-15, 0, 15], rest: [-3, 0, 0] };
        case 5:
          return { first: [-15, 0, 15], rest: [0, 0, 0] };
      }
    }

    // Fallback to random generation based on ID
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const randomSeed = pseudoRandom(id * 9999);
    const angle = (randomSeed * 12) - 6;
    return { first: [-15, 0, 15], rest: [angle, 0, -angle / 2] };
  };

  const rotationValues = getRotationValues(card.id, categoryIndex);

  const removeCard = useCallback((direction: 'left' | 'right') => {
    'worklet';
    runOnJS(onSwipe)(direction);
  }, [onSwipe]);

  const handlePress = useCallback(() => {
    'worklet';
    runOnJS(onPress)();
  }, [onPress]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (isFirst) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (isFirst) {
        const direction = translateX.value > 0 ? 'right' : 'left';
        if (Math.abs(event.velocityX) > 400 || Math.abs(translateX.value) > SCREEN_WIDTH * 0.4) {
          // Swipe away with natural momentum
          translateX.value = withSpring(
            Math.sign(translateX.value) * SCREEN_WIDTH * 1.5,
            springConfigSwipe,
            (finished) => {
              if (finished) {
                runOnJS(onSwipe)(direction);
              }
            }
          );
        } else {
          // Snap back with precision
          translateX.value = withSpring(0, springConfigSnap);
        }
      }
    });

  // Pre-calculate static transform values to avoid recalculating on every frame
  const staticTranslateY = useMemo(() => index * 1, [index]);
  // Determine stack direction based on category index for organic variety (Left, Right, Middle)
  const stackDirection = useMemo(() => {
    if (categoryIndex === undefined) return 1;
    const mod = categoryIndex % 3;
    if (mod === 0) return 1;  // Right
    if (mod === 1) return -1; // Left
    return 0;                 // Middle (Symmetric)
  }, [categoryIndex]);
  const staticTranslateX = useMemo(() => index * 15 * stackDirection, [index, stackDirection]);
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
      [0.92, 1, 1.08], // Slightly more pronounced scale diff
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [-24, 0, 0], // Deeper vertical compression
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
        shadowOpacity: 0.15,
        shadowRadius: 3,
      };
    }

    // Top card dynamic shadow and lift
    const shadowOpacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [0.4, 0.6],
      Extrapolate.CLAMP
    );

    const shadowRadius = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [5, 15],
      Extrapolate.CLAMP
    );

    const elevation = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [3, 10],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: interpolate(Math.abs(translateX.value), [0, SCREEN_WIDTH * 0.5], [0, -4], Extrapolate.CLAMP) },
        { rotate: `${rotate}deg` },
      ],
      shadowOpacity,
      shadowRadius,
      elevation,
    };
  }, [isFirst, index, activeIndex, translateX, SCREEN_WIDTH, rotationValues, staticTranslateY, staticTranslateX, staticOpacity]);

  // Emil's pattern: Enhanced parallax effect with smoother interpolation
  const animatedImageStyle = useAnimatedStyle(() => {
    'worklet';
    if (!isFirst) return {};

    // Invert parallax: image moves SLIGHTLY opposite to swipe for depth
    const parallaxX = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [40, 0, -40],
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
        { scale: 1.15 }, // Base scale to provide "bleed" area for parallax
        { translateX: parallaxX },
        { scale: parallaxScale }
      ]
    };
  }, [isFirst, translateX, SCREEN_WIDTH]);

  return (
    <GestureDetector gesture={panGesture}>
      <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
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