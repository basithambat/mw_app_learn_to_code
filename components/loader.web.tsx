import React from "react";
import { View, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";

const Loader: React.FC = () => {
    return (
        <View className="absolute -bottom-28 left-0 right-0">
            <View className="relative w-full h-[1200px]">
                <View className="absolute  bg-white " />

                <View className="absolute inset-0 flex items-center justify-center">
                    <View style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 5
                    }}>
                        <ActivityIndicator size="large" color="#05E1D7" />
                    </View>
                </View>

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
