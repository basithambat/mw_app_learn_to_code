import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Dimensions, Platform, InteractionManager } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_VELOCITY = 0.3;
const VERTICAL_THRESHOLD = -10;
const DOWN_SWIPE_THRESHOLD = 50;
const DISMISS_THRESHOLD = 100; // Threshold for dismissing the modal

// Airbnb/Bumble-style gesture thresholds
const HORIZONTAL_INTENT_THRESHOLD = 30; // Minimum horizontal movement to consider horizontal intent
const VERTICAL_INTENT_THRESHOLD = 20; // Minimum vertical movement to consider vertical intent
const DIRECTION_LOCK_RATIO = 2.0; // Horizontal must be 2x vertical to lock horizontal, vice versa

interface UseCombinedSwipeProps {
  data: any[];
  currentIndex: number;
  onSwipeLeft?: (index: number) => void;
  onSwipeRight?: (index: number) => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  isCommentModalVisible?: boolean;
}

export const useCombinedSwipe = ({
  data,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  isCommentModalVisible = false
}: UseCombinedSwipeProps) => {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const bottomThreshold = Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.6 : SCREEN_HEIGHT * 0.7;
  const hasCalledSwipeUp = useRef(false);
  const hasCalledSwipeDown = useRef(false);
  
  // Gesture direction lock - prevents accidental horizontal swipes during vertical scroll
  const gestureDirectionLock = useRef<'horizontal' | 'vertical' | null>(null);
  const initialGestureDistance = useRef({ dx: 0, dy: 0 });
  
  // Reset gesture state when comment modal closes (component reopens)
  useEffect(() => {
    if (!isCommentModalVisible) {
      directionLock.value = null;
      gestureDirectionLock.current = null;
      initialGestureDistance.current = { dx: 0, dy: 0 };
      hasCalledSwipeUp.current = false;
      hasCalledSwipeDown.current = false;
    }
  }, [isCommentModalVisible, directionLock]);
  
  // Reanimated shared values (replacing Animated.Value)
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Emil Kowalski's recommended spring configs
  const springConfigSnappy = {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  };

  const springConfigSmooth = {
    damping: 25,
    stiffness: 200,
    mass: 1,
  };

  const springConfigBouncy = {
    damping: 15,
    stiffness: 350,
    mass: 0.5,
  };

  const resetAnimations = useCallback(() => {
    'worklet';
    // Emil's pattern: Use snappy config for quick reset
    translateY.value = withSpring(0, springConfigSnappy);
    opacity.value = withSpring(1, springConfigSnappy);
    scale.value = withSpring(1, springConfigSnappy);
  }, []);

  const animateOut = useCallback(() => {
    'worklet';
    // Emil's pattern: Use smooth config for exit animations
    translateY.value = withSpring(SCREEN_HEIGHT, springConfigSmooth, (finished) => {
      if (finished) {
        runOnJS(() => {
          InteractionManager.runAfterInteractions(() => {
            if (onSwipeDown) onSwipeDown();
          });
        })();
      }
    });
    opacity.value = withSpring(0, springConfigSmooth);
    scale.value = withSpring(0.95, springConfigSmooth);
  }, [onSwipeDown]);

  // Shared value for direction lock (worklet-compatible)
  const directionLock = useSharedValue<'horizontal' | 'vertical' | null>(null);

  // Create gesture handler using Gesture Handler API
  // Bumble/Tinder approach: Fail immediately on horizontal, only handle vertical
  // Key: Use failOffsetX to give FlatList priority for horizontal gestures
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      // Only activate on vertical movement - let FlatList handle horizontal
      // Use aggressive failOffsetX to fail immediately on horizontal movement
      .activeOffsetY([-VERTICAL_INTENT_THRESHOLD, VERTICAL_INTENT_THRESHOLD])
      .failOffsetX([-10, 10]) // Fail immediately on any horizontal movement (Bumble/Tinder style)
      .enabled(!isCommentModalVisible)
      .onBegin(() => {
        'worklet';
        // Reset direction lock on new gesture
        directionLock.value = null;
        gestureDirectionLock.current = null;
        initialGestureDistance.current = { dx: 0, dy: 0 };
        hasCalledSwipeUp.current = false;
        hasCalledSwipeDown.current = false;
      })
      .onTouchesMove((event, state) => {
        'worklet';
        if (isCommentModalVisible) {
          state.fail();
          return;
        }

        const touch = event.allTouches[0];
        if (!touch) {
          state.fail();
          return;
        }

        // Calculate movement from initial touch
        const dx = touch.translationX;
        const dy = touch.translationY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Bumble/Tinder-style: Fail immediately if horizontal movement is detected
        // This ensures FlatList gets priority for horizontal gestures
        if (absDx > absDy) {
          // Horizontal movement detected - fail immediately to let FlatList handle it
          directionLock.value = 'horizontal';
          gestureDirectionLock.current = 'horizontal';
          state.fail();
          return;
        }

        // Only proceed if movement is clearly vertical
        if (absDy > absDx * DIRECTION_LOCK_RATIO) {
          directionLock.value = 'vertical';
          gestureDirectionLock.current = 'vertical';
          // Allow activation (activeOffsetY will handle it)
        } else if (absDx < HORIZONTAL_INTENT_THRESHOLD && absDy < VERTICAL_INTENT_THRESHOLD) {
          // Too early to determine - let it pass through
          return;
        } else {
          // Ambiguous - prefer vertical (primary interaction)
          directionLock.value = 'vertical';
          gestureDirectionLock.current = 'vertical';
        }
      })
      .onUpdate((event) => {
        'worklet';
        const { translationX, translationY, absoluteY } = event;
        
        // Get pageY equivalent (absoluteY is screen-relative)
        const pageY = absoluteY;
        
        // Only process if locked to vertical direction
        if (directionLock.value === 'vertical') {
          // Handle swipe up - more sensitive threshold for better UX
          if (!hasCalledSwipeUp.current && 
              translationY < VERTICAL_THRESHOLD && 
              pageY > bottomThreshold && 
              onSwipeUp) {
            hasCalledSwipeUp.current = true;
            runOnJS(onSwipeUp)();
            return;
          }
          
          // Emil's pattern: Handle swipe down with live animation and resistance
          if (translationY > 0) {
            const resistance = 0.5; // Resistance factor for natural feel
            translateY.value = translationY * resistance;
            
            // Emil's pattern: Use interpolation for smoother opacity/scale transitions
            const progress = Math.min(1, translationY / SCREEN_HEIGHT);
            opacity.value = interpolate(
              progress,
              [0, 1],
              [1, 0.3],
              Extrapolate.CLAMP
            );
            scale.value = interpolate(
              progress,
              [0, 1],
              [1, 0.95],
              Extrapolate.CLAMP
            );
          }
        }

        // Horizontal gestures are completely ignored - FlatList handles them natively
      })
      .onEnd((event) => {
        'worklet';
        const { translationY } = event;
        const wasVertical = directionLock.value === 'vertical';
        
        runOnJS(setScrollEnabled)(true);
        hasCalledSwipeUp.current = false;
        
        // Reset direction lock for next gesture
        directionLock.value = null;
        gestureDirectionLock.current = null;
        initialGestureDistance.current = { dx: 0, dy: 0 };
        
        if (!isCommentModalVisible && wasVertical && translationY > DISMISS_THRESHOLD) {
          animateOut();
        } else {
          resetAnimations();
        }
      })
      .onCancel(() => {
        'worklet';
        runOnJS(setScrollEnabled)(true);
        hasCalledSwipeUp.current = false;
        directionLock.value = null;
        gestureDirectionLock.current = null;
        initialGestureDistance.current = { dx: 0, dy: 0 };
        resetAnimations();
      })
      .onFinalize(() => {
        'worklet';
        // Ensure state is reset on finalize
        directionLock.value = null;
        gestureDirectionLock.current = null;
        initialGestureDistance.current = { dx: 0, dy: 0 };
      });
  }, [
    isCommentModalVisible,
    bottomThreshold,
    resetAnimations,
    animateOut,
    onSwipeUp,
    directionLock,
  ]);

  // Animated style using Reanimated
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  }, []);

  return {
    panGesture, // Return gesture instead of panResponder
    scrollEnabled,
    animatedStyle
  };
};
