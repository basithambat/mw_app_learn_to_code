// import { useRef, useState } from 'react';
// import { PanResponder, Dimensions } from 'react-native';


// const SCREEN_WIDTH = Dimensions.get('window').width;
// const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width
// const SWIPE_VELOCITY = 0.3;

// interface UseSwipeHorizontalProps {
//   data: any[];
//   currentIndex: number;
//   onSwipeLeft?: (index: number) => void;
//   onSwipeRight?: (index: number) => void;
// }

// export const useSwipeHorizontal = ({
//   data,
//   currentIndex,
//   onSwipeLeft,
//   onSwipeRight,
// }: UseSwipeHorizontalProps) => {
//   const [scrollEnabled, setScrollEnabled] = useState(true);
//   const position = useRef(0);

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onMoveShouldSetPanResponder: (_, { dx, dy }) => {
//       return Math.abs(dx) > Math.abs(dy);
//     },
//     onPanResponderGrant: () => {
//       setScrollEnabled(false);
//     },
//     onPanResponderMove: (_, { dx }) => {
//       position.current = dx;
//     },
//     onPanResponderRelease: (_, { dx, vx }) => {
//       setScrollEnabled(true);
      
//       const direction = Math.sign(dx);
//       const isActionActive = Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > SWIPE_VELOCITY;

//       if (isActionActive) {
//         if (direction > 0 && currentIndex > 0) {
//           // Swipe right
//           onSwipeRight?.(currentIndex - 1);
//         } else if (direction < 0 && currentIndex < data.length - 1) {
//           // Swipe left
//           onSwipeLeft?.(currentIndex + 1);
//         }
//       }

//       position.current = 0;
//     },
//     onPanResponderTerminate: () => {
//       setScrollEnabled(true);
//       position.current = 0;
//     },
//   });

//   return {
//     panResponder,
//     scrollEnabled,
//   };
// };