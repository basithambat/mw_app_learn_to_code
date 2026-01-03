// import React, { useState, useRef } from 'react';
// import { View, TouchableOpacity, Text, Animated } from 'react-native';
// import { AntDesign } from '@expo/vector-icons';

// interface ExpandProps {
//   children: React.ReactNode;
// }

// const Expand: React.FC<ExpandProps> = ({ children }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [maxHeight, setMaxHeight] = useState(0);
//   const animatedHeight = useRef(new Animated.Value(0)).current;

//   const toggleExpand = () => {
//     if (expanded) {
//       Animated.timing(animatedHeight, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: false,
//       }).start();
//     } else {
//       Animated.timing(animatedHeight, {
//         toValue: maxHeight,
//         duration: 300,
//         useNativeDriver: false,
//       }).start();
//     }
//     setExpanded(!expanded);
//   };

//   return (
//     <View>
//       <TouchableOpacity onPress={toggleExpand} className="py-2 flex-row items-center justify-center">
//         <Text className="mr-2">{expanded ? 'Hide Replies' : 'Show Replies'}</Text>
//         {expanded ? (
//           <AntDesign name="up" size={16} color="black" />
//         ) : (
//           <AntDesign name="down" size={16} color="black" />
//         )}
//       </TouchableOpacity>
//       <Animated.View
//         style={{ height: animatedHeight }}
//         onLayout={(event) => {
//           if (!expanded) {
//             setMaxHeight(event.nativeEvent.layout.height);
//           }
//         }}
//       >
//         {children}
//       </Animated.View>
//     </View>
//   );
// };

// export default Expand;