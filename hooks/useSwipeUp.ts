// import { useRef } from 'react';
// import { PanResponder, PanResponderGestureState, Dimensions, Platform } from 'react-native';

// interface UseSwipeGestureProps {
//   onSwipeUp?: () => void;
//   threshold?: number;
//   isCommentModalVisible?: boolean;
// }

// export const useSwipeGesture = ({
//   onSwipeUp,
//   threshold = -50,
//   isCommentModalVisible = false
// }: UseSwipeGestureProps) => {
//   const swipeDetected = useRef(false);
//   const { height: screenHeight } = Dimensions.get('window');
//   const bottomThreshold = Platform.OS === 'ios' ? screenHeight * 0.6 : screenHeight * 0.7;

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: (evt) => {
//         // Only respond if comment modal is closed and touch is in bottom area
//         return !isCommentModalVisible && evt.nativeEvent.pageY > bottomThreshold;
//       },
//       onMoveShouldSetPanResponder: (evt, gestureState: PanResponderGestureState) => {
//         if (isCommentModalVisible) return false;

//         if (evt.nativeEvent.pageY > bottomThreshold &&
//             gestureState.dy < threshold && 
//             Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
//           swipeDetected.current = true;
//           return true;
//         }
//         return false;
//       },
//       onPanResponderMove: (evt, gestureState: PanResponderGestureState) => {
//         if (isCommentModalVisible) return;

//         if (evt.nativeEvent.pageY > bottomThreshold && 
//             gestureState.dy < threshold && 
//             !swipeDetected.current && 
//             onSwipeUp) {
//           swipeDetected.current = true;
//           onSwipeUp();
//         }
//       },
//       onPanResponderRelease: () => {
//         swipeDetected.current = false;
//       },
//       onPanResponderTerminate: () => {
//         swipeDetected.current = false;
//       },
//     })
//   ).current;

//   return panResponder;
// };