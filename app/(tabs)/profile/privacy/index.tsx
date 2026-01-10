import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Linking, Alert } from 'react-native';
import { router, Href } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, loggedInUserDataSelector } from '@/redux/slice/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deletUser } from '@/api/apiUser';
import LottieView from 'lottie-react-native';
import { AuthPayload } from '@/types/UserTypes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Route = Href<string>;

const PRIVACY_URL = 'https://whatsay-privacy-and-policy.vercel.app/';
const TERMS_URL = 'https://whatsay-web.vercel.app/terms';

const PrivacySettingsScreen = () => {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const animation = useRef<LottieView>(null);
  const loggedInUserData: AuthPayload | null = useSelector(loggedInUserDataSelector);

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Cannot open this URL',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong while opening the link',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const userId = loggedInUserData?.user.id;

    if (!userId) {
      console.log("User id not found");
      setIsDeleting(false);
      return;
    }

    try {
      const res = await deletUser(userId);
      if (res?.success) {
        await AsyncStorage.removeItem("user");
        dispatch(clearUser());
        router.replace("/login/loginScreen" as Route);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Error is:", error.message);
      } else {
        console.log("Unknown error occurred:", error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-domine text-center flex-1">Privacy Settings</Text>
        <View className="w-10" />
      </View>

      {/* Settings List */}
      <View className="px-[14px] mt-6">
        {/* Privacy */}
        <TouchableOpacity
          className="flex-row items-center justify-between py-4 border-b border-gray-100"
          onPress={() => openURL(PRIVACY_URL)}
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 items-center justify-center mr-3">
              <Image
                source={require('@/assets/images/profileIcons/private.webp')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-lg">Privacy</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Terms & Conditions */}
        <TouchableOpacity
          className="flex-row items-center justify-between py-4"
          onPress={() => openURL(TERMS_URL)}
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 items-center justify-center mr-3">
              <Image
                source={require('@/assets/images/profileIcons/terms.webp')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-lg">Terms & Conditions</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Delete Account Button */}
      <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          className="bg-[#FFF1F1] rounded-xl h-[56px] flex justify-center items-center"
          onPress={handleDeleteAccount}
        >
          {!isDeleting && (
            <Text className="text-[#D32F2F] text-center font-geist-medium text-base">
              Delete your account
            </Text>
          )}
          {isDeleting && (
            <LottieView
              autoPlay
              ref={animation}
              style={{
                width: 24,
                height: 24,
              }}
              source={require("@/assets/animations/loading.json")}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PrivacySettingsScreen;