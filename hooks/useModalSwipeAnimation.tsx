// import { useRef, useCallback } from 'react';
// import { Animated, PanResponder, Dimensions } from 'react-native';

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// const SWIPE_THRESHOLD = 50;

// export const useModalSwipeAnimation = (onClose: () => void) => {
//   const translateY = useRef(new Animated.Value(0)).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, gestureState) => {
//         // Only respond to vertical gestures
//         return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10;
//       },
//       onPanResponderMove: (_, gestureState) => {
//         if (gestureState.dy > 0) {
//           translateY.setValue(gestureState.dy);
//         }
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         if (gestureState.dy > SWIPE_THRESHOLD) {
//           Animated.timing(translateY, {
//             toValue: SCREEN_HEIGHT,
//             duration: 300,
//             useNativeDriver: true,
//           }).start(onClose);
//         } else {
//           Animated.spring(translateY, {
//             toValue: 0,
//             useNativeDriver: true,
//           }).start();
//         }
//       },
//     })
//   ).current;

//   const resetAnimation = useCallback(() => {
//     translateY.setValue(0);
//   }, [translateY]);

//   return {
//     translateY,
//     panHandlers: panResponder.panHandlers,
//     resetAnimation,
//   };
// };