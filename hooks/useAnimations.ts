import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Animated, Easing, PanResponder, PanResponderGestureState, Dimensions, Platform } from 'react-native';

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
      onClose();
      requestAnimationFrame(() => {
        animatedValues.modalY.setValue(0);
      });
    });
  }, [animatedValues.modalY, onClose]);

  const panResponder = useMemo(() => {
    let lastGestureTime = 0;
    const GESTURE_DELAY = 1000 / 60;

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) => {
        const now = Date.now();
        if (now - lastGestureTime < GESTURE_DELAY) return false;
        lastGestureTime = now;
        return Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 5 && !isCommentSectionOpen;
      },
      onPanResponderMove: Animated.event(
        [null, { dy: animatedValues.modalY }],
        { useNativeDriver: true }
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (!isCommentSectionOpen) {
          handlePanResponderRelease(gestureState);
        }
      },
    });
  }, [isCommentSectionOpen, animatedValues.modalY]);

  const handlePanResponderRelease = useCallback((gestureState: PanResponderGestureState) => {
    if (!isCommentSectionOpen) {
      if (gestureState.dy > SWIPE_THRESHOLD || gestureState.vy > 5) {
        closeModal();
      } else {
        Animated.spring(animatedValues.modalY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
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
      // First spring: Bounce up higher with less friction for more "bounce"
      Animated.spring(animatedValues.dragIndicator, {
        toValue: isCommentSectionOpen ? -12 : 14, // Increased initial bounce height
        useNativeDriver: true,
        tension: 4000,  // Increased tension for faster initial movement
        friction: 30,   // Reduced friction for more bounce
      }),
      // Second spring: Settle to final position with more dampening
      Animated.spring(animatedValues.dragIndicator, {
        toValue: isCommentSectionOpen ? -2 : 12,  // Final resting position
        useNativeDriver: true,
        tension: 20,   // Lower tension for smoother settling
        friction: 3,   // Moderate friction for gentle settling
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