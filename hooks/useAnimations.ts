import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Dimensions, Platform, InteractionManager } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Emil Kowalski's recommended spring configs for natural, responsive animations
const SPRING_CONFIG_SNAPPY = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

const SPRING_CONFIG_SMOOTH = {
  damping: 25,
  stiffness: 200,
  mass: 1,
};

const SPRING_CONFIG_BOUNCY = {
  damping: 15,
  stiffness: 350,
  mass: 0.5,
};

// Timing config for non-spring animations
const TIMING_CONFIG = {
  duration: Platform.select({ ios: 250, android: 300 }),
};

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500; // Velocity-based threshold (Emil's pattern)

interface AnimatedValues {
  imageSize: SharedValue<number>;
  gradientOpacity: SharedValue<number>;
  scale: SharedValue<number>;
  titlePosition: SharedValue<number>;
  dragIndicator: SharedValue<number>;
  contentOpacity: SharedValue<number>;
  modalY: SharedValue<number>;
}

export const useNewsItemAnimations = (
  isCommentSectionOpen: boolean,
  onClose: () => void
) => {
  // Emil Kowalski pattern: Use SharedValue instead of Animated.Value
  const imageSize = useSharedValue(100);
  const gradientOpacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const titlePosition = useSharedValue(200);
  const dragIndicator = useSharedValue(12);
  const contentOpacity = useSharedValue(1);
  const modalY = useSharedValue(0);

  const animatedValues = useMemo<AnimatedValues>(
    () => ({
      imageSize,
      gradientOpacity,
      scale,
      titlePosition,
      dragIndicator,
      contentOpacity,
      modalY,
    }),
    []
  );

  // Emil's pattern: Use velocity-aware animations
  const closeModal = useCallback(
    (velocity?: number) => {
      'worklet';
      // Use velocity if provided for more natural feel
      const targetY = screenHeight;
      
      modalY.value = withSpring(
        targetY,
        velocity && Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD
          ? SPRING_CONFIG_BOUNCY
          : SPRING_CONFIG_SMOOTH,
        (finished) => {
          if (finished) {
            runOnJS(() => {
              InteractionManager.runAfterInteractions(() => {
                modalY.value = 0;
                onClose();
              });
            })();
          }
        }
      );
    },
    [modalY, onClose]
  );

  // Emil's pattern: Create pan gesture with proper worklet handling
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([10, -10]) // Only activate on vertical movement
      .failOffsetX([-10, 10]) // Fail on horizontal movement
      .onUpdate((event) => {
        'worklet';
        // Add resistance to swipe down
        const resistance = 0.5;
        modalY.value = Math.max(0, event.translationY * resistance);
        
        // Update opacity and scale based on drag distance (Emil's pattern)
        const progress = Math.min(1, modalY.value / screenHeight);
        opacity.value = 1 - progress * 0.5;
        scale.value = 1 - progress * 0.1;
      })
      .onEnd((event) => {
        'worklet';
        const { translationY, velocityY } = event;
        
        // Velocity-based decision (Emil's pattern)
        const shouldClose =
          translationY > SWIPE_THRESHOLD || velocityY > SWIPE_VELOCITY_THRESHOLD;
        
        if (shouldClose) {
          closeModal(velocityY);
        } else {
          // Spring back with velocity
          modalY.value = withSpring(0, SPRING_CONFIG_SNAPPY);
          opacity.value = withSpring(1, SPRING_CONFIG_SNAPPY);
          scale.value = withSpring(1, SPRING_CONFIG_SNAPPY);
        }
      });
  }, [modalY, closeModal]);

  // Track opacity and scale for modal drag
  const opacity = useSharedValue(1);
  const modalScale = useSharedValue(1);

  // Emil's pattern: Animate state changes with proper spring physics
  useEffect(() => {
    // Image size animation (non-native, so use timing)
    imageSize.value = withTiming(
      isCommentSectionOpen ? 94 : 100,
      TIMING_CONFIG
    );

    // Gradient opacity (non-native)
    gradientOpacity.value = withTiming(
      isCommentSectionOpen ? 1 : 0,
      TIMING_CONFIG
    );

    // Native animations use spring for natural feel
    titlePosition.value = withSpring(
      isCommentSectionOpen ? 0 : 200,
      SPRING_CONFIG_SNAPPY
    );

    contentOpacity.value = withSpring(
      isCommentSectionOpen ? 0 : 1,
      SPRING_CONFIG_SNAPPY
    );

    scale.value = withSpring(1, SPRING_CONFIG_SNAPPY);

    // Drag indicator: Emil's pattern - sequence of springs for micro-interactions
    if (isCommentSectionOpen) {
      dragIndicator.value = withSpring(-12, SPRING_CONFIG_BOUNCY, () => {
        dragIndicator.value = withSpring(-2, SPRING_CONFIG_SMOOTH);
      });
    } else {
      dragIndicator.value = withSpring(14, SPRING_CONFIG_BOUNCY, () => {
        dragIndicator.value = withSpring(12, SPRING_CONFIG_SMOOTH);
      });
    }
  }, [isCommentSectionOpen, imageSize, gradientOpacity, titlePosition, contentOpacity, scale, dragIndicator]);

  // Emil's pattern: Animated styles using worklets
  const modalAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: modalY.value },
        { scale: modalScale.value },
      ],
      opacity: opacity.value,
    };
  }, []);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      width: `${imageSize.value}%`,
    };
  }, []);

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: gradientOpacity.value,
    };
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: titlePosition.value }],
    };
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const opacityValue = contentOpacity.value;
    const translateY = interpolate(
      opacityValue,
      [0, 1],
      [50, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: opacityValue,
      transform: [{ translateY }],
    };
  }, []);

  const dragIndicatorAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: dragIndicator.value }],
    };
  }, []);

  return {
    animatedValues,
    closeModal,
    panGesture,
    modalAnimatedStyle,
    imageAnimatedStyle,
    gradientAnimatedStyle,
    titleAnimatedStyle,
    contentAnimatedStyle,
    dragIndicatorAnimatedStyle,
  };
};
