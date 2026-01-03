// app/loginScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithGoogle } from '@/services/firebaseAuth';
import { useFirebaseAuth } from '@/config/firebaseAuthContext';

const LoginScreen = () => {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigation will happen automatically via auth state change
      router.replace({
        pathname: "/discoverScreens"
      });
    } catch (error: any) {
      console.error("Google Sign-in Error:", error);
      Alert.alert("Sign In Error", error.message || "Failed to sign in with Google");
    }
  };

  // Redirect if already signed in
  useEffect(() => {
    if (!loading && user) {
      router.replace({
        pathname: "/discoverScreens"
      });
    }
  }, [user, loading]);

  return (
    <ImageBackground
      source={require("@/assets/loginBg.webp")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 px-[16px]">
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-2xl text-black">←</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center mt-[372px]">
          <View className="mb-[66px] items-center">
            <Text className="font-domine text-[28px] mb-2 text-center text-black">
              News curated
            </Text>
            <Text className="font-domine text-[28px] text-center text-black">
              Perspectives invited
            </Text>
          </View>

          <TouchableOpacity
            className="w-full bg-black rounded-[12px] py-4 px-6 flex-row items-center justify-center mb-4"
            onPress={handleGoogleSignIn}
          >
            <Image
              source={require("@/assets/googleIcon.webp")}
              className="w-7 h-7 mr-3"
              resizeMode="contain"
            />
            <Text className="text-white font-medium text-base">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-white rounded-[12px] py-4 px-6 flex-row items-center justify-center"
            onPress={() => {
              router.replace({
                pathname: '/login/mobile'
              })
            }}
          >
            <Image
              source={require("@/assets/mobileIcon.webp")}
              className="w-7 h-7 mr-3"
              resizeMode="contain"
            />
            <Text className="text-black font-medium text-base">
              Continue with Phone
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginScreen;
