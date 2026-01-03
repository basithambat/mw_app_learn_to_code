import React from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";
import { BlurView } from "expo-blur";

const Loader: React.FC = () => {
  return (
    <View className="absolute -bottom-28 left-0 right-0">
      {/* Container with increased height */}
      <View className="relative w-full h-[1200px]"> 
        {/* Base white background */}
        <View className="absolute  bg-white " />
        
        {/* Animation container with explicit size handling */}
        <View className="absolute inset-0 flex items-end justify-end bottom-44">
          <LottieView
            source={require("@/assets/animations/loading2.json")}
            autoPlay
            loop
            style={{
              width: '100%',
              height: '100%',
              // Setting aspectRatio based on original animation dimensions
              aspectRatio: 1440/520,
              transform: [{ scale: 2 }], // Scale up the animation
            }}
            resizeMode="cover"
            hardwareAccelerationAndroid={true}
            renderMode="AUTOMATIC"
            speed={1}
            cacheStrategy="strong"
          />
        </View>
        
        {/* Blur overlay */}
        <BlurView
          intensity={100}
          tint="light"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </View>
    </View>
  );
};

export default Loader;