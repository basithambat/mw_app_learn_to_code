// import { useMemo, useEffect } from 'react';
// import { Animated, Easing } from 'react-native';

// export const useNewsItemAnimations = (isCommentSectionOpen: boolean) => {
//   const animatedValues = useMemo(() => ({
//     imageSize: new Animated.Value(100),
//     gradientOpacity: new Animated.Value(0),
//     scale: new Animated.Value(1),
//     titlePosition: new Animated.Value(1),
//     contentOpacity: new Animated.Value(1),
//   }), []);

//   useEffect(() => {
//     const animations = [
//       Animated.timing(animatedValues.imageSize, {
//         toValue: isCommentSectionOpen ? 94 : 100,
//         duration: 300,
//         useNativeDriver: false,
//         easing: Easing.inOut(Easing.ease),
//       }),
//       Animated.timing(animatedValues.gradientOpacity, {
//         toValue: isCommentSectionOpen ? 1 : 0,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(animatedValues.titlePosition, {
//         toValue: isCommentSectionOpen ? 0 : 200,
//         duration: 300,
//         useNativeDriver: true,
//         easing: Easing.inOut(Easing.ease),
//       }),
//       Animated.timing(animatedValues.contentOpacity, {
//         toValue: isCommentSectionOpen ? 0 : 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ];

//     Animated.parallel(animations).start();
//   }, [isCommentSectionOpen, animatedValues]);

//   return {
//     animatedValues,
//   };
// };