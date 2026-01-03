import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Animated, Easing, PanResponder, PanResponderGestureState, Dimensions, Platform, InteractionManager } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AnimatedValues {
  imageSize: Animated.Value;
  gradientOpacity: Animated.Value;
  scale: Animated.Value;
  titlePosition: Animated.Value;
  dragIndicator: Animated.Value;
  contentOpacity: Animated.Value;
  modalY: Animated.Value;
}

const SWIPE_THRESHOLD = 100;
const ANIMATION_CONFIG = {
  duration: Platform.select({ ios: 250, android: 300 }),
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};
// Optimized spring config for smoother animations - Airbnb style (Snappy & Fluid)
const SPRING_CONFIG = {
  damping: 30,
  stiffness: 350,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

export const useNewsItemAnimations = (isCommentSectionOpen: boolean, onClose: () => void) => {
  const animatedValuesRef = useRef<AnimatedValues>({
    imageSize: new Animated.Value(100),
    gradientOpacity: new Animated.Value(0),
    scale: new Animated.Value(1),
    titlePosition: new Animated.Value(1),
    dragIndicator: new Animated.Value(1),
    contentOpacity: new Animated.Value(1),
    modalY: new Animated.Value(0),
  });

  const animatedValues = useMemo(() => animatedValuesRef.current, []);

  const closeModal = useCallback(() => {
    Animated.timing(animatedValues.modalY, {
      toValue: screenHeight,
      duration: ANIMATION_CONFIG.duration,
      useNativeDriver: true,
      easing: ANIMATION_CONFIG.easing,
    }).start(() => {
      // Use InteractionManager to defer reset until animations complete
      InteractionManager.runAfterInteractions(() => {
        animatedValues.modalY.setValue(0);
        onClose();
      });
    });
  }, [animatedValues.modalY, onClose]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) => {
        // Optimized: Remove throttling - let native driver handle it
        return Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 5 && !isCommentSectionOpen;
      },
      onPanResponderMove: Animated.event(
        [null, { dy: animatedValues.modalY }],
        { 
          useNativeDriver: true,
          listener: undefined, // Remove listener to avoid JS thread overhead
        }
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (!isCommentSectionOpen) {
          handlePanResponderRelease(gestureState);
        }
      },
    });
  }, [isCommentSectionOpen, animatedValues.modalY, handlePanResponderRelease]);

  const handlePanResponderRelease = useCallback((gestureState: PanResponderGestureState) => {
    if (!isCommentSectionOpen) {
      if (gestureState.dy > SWIPE_THRESHOLD || gestureState.vy > 5) {
        closeModal();
      } else {
        // Use optimized spring config for smoother bounce-back
        Animated.spring(animatedValues.modalY, {
          toValue: 0,
          useNativeDriver: true,
          ...SPRING_CONFIG,
        }).start();
      }
    }
  }, [isCommentSectionOpen, animatedValues.modalY, closeModal]);

  useEffect(() => {
    const createTiming = (value: Animated.Value, toValue: number, useNative: boolean = true) =>
      Animated.timing(value, {
        toValue,
        duration: ANIMATION_CONFIG.duration,
        easing: ANIMATION_CONFIG.easing,
        useNativeDriver: useNative,
      });

    const nativeAnimations = [
      createTiming(animatedValues.titlePosition, isCommentSectionOpen ? 0 : 200),
      createTiming(animatedValues.contentOpacity, isCommentSectionOpen ? 0 : 1),
      createTiming(animatedValues.scale, isCommentSectionOpen ? 1 : 1),
    ];

    const nonNativeAnimations = [
      createTiming(animatedValues.imageSize, isCommentSectionOpen ? 94 : 100, false),
      createTiming(animatedValues.gradientOpacity, isCommentSectionOpen ? 1 : 0, false),
    ];

    const dragIndicatorAnimation = Animated.sequence([
      // First spring: Optimized for smoother initial movement
      Animated.spring(animatedValues.dragIndicator, {
        toValue: isCommentSectionOpen ? -12 : 14,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
        mass: 0.8,
      }),
      // Second spring: Optimized settling animation
      Animated.spring(animatedValues.dragIndicator, {
        toValue: isCommentSectionOpen ? -2 : 12,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
        mass: 1,
      })
    ]);

    Animated.parallel([
      Animated.parallel(nativeAnimations),
      Animated.parallel(nonNativeAnimations),
      dragIndicatorAnimation,
    ]).start();

    return () => {
      nativeAnimations.forEach(anim => anim.stop());
      nonNativeAnimations.forEach(anim => anim.stop());
      dragIndicatorAnimation.stop();
    };
  }, [isCommentSectionOpen, animatedValues]);

  return {
    animatedValues,
    closeModal,
  };
};