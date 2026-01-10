import { useCallback } from 'react';
import { Dimensions, StyleSheet, Platform } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 1;
const INPUT_CONTAINER_HEIGHT = 94;

export const useCommentSectionAnimation = (onClose: () => void) => {
  const translateY = useSharedValue(MODAL_HEIGHT);

  const scrollTo = useCallback((destination: number) => {
    'worklet';
    translateY.value = withSpring(destination, { damping: 50, stiffness: 300 });
  }, []);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startY: number }>({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateY.value = Math.max(0, context.startY + event.translationY);
    },
    onEnd: (event) => {
      if (translateY.value > MODAL_HEIGHT / 2 || event.velocityY > 500) {
        scrollTo(MODAL_HEIGHT);
        runOnJS(onClose)();
      } else {
        scrollTo(0);
      }
    },
  });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return {
    scrollTo,
    gestureHandler,
    rBottomSheetStyle,
  };
};

export const commentSectionStyles = StyleSheet.create({
  modalContainer: {
    height: "100%",
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#F3F4F6', // Surface Unity
  },
  commentContainer: {
    height: '100%', // Use full available space
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16, // Safe area handled by parent inset or calculated padding
    paddingBottom: 8,
    backgroundColor: 'transparent', // Seamless header
    // No border
  },
  headerText: {
    fontFamily: 'Geist-Medium',
    fontSize: 18,
    color: '#000',
  },
  commentList: {
    flex: 1,
    paddingHorizontal: 0, // Edge to edge or slightly padded? Reference shows edge to edge with padding in items
  },
  expandableInputContainer: {
    // Moved inline to component for flexibility
  },
  replyingToInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  replyingToText: {
    fontFamily: 'Geist',
    fontSize: 12,
    color: '#9DA2A9',
  },
  inputContainer: {
    width: SCREEN_WIDTH,
    position: "absolute",
    bottom: 0,
    //Height controlled by content now
  },
  inputField: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentIcon: {
    width: 40,
    height: 40
  },
});