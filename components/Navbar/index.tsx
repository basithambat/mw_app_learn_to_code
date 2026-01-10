// components/Navbar/index.tsx
import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import menuIcon from '@/assets/iconMenu.webp';
import { useSelector } from "react-redux";
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import TermsModal from '@/components/t&c';
import { Feather } from '@expo/vector-icons';

const NavBar = () => {
  const router = useRouter();
  const loggedInUserData = useSelector(loggedInUserDataSelector);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

  const handleProfilePress = () => {
    if (loggedInUserData?.user) {  // Add optional chaining here
      router.push('/(tabs)/profileScreen');
    } else {
      setIsTermsModalVisible(true);
    }
  };

  const handleTermsAccept = () => {
    // You might want to store this acceptance in your Redux store or AsyncStorage
    console.log('Terms accepted');
  };

  const userProfilePic = loggedInUserData?.user?.pic;  // Safely access nested properties

  return (
    <View className="absolute top-0 left-0 right-0 z-50 ">
      <View className="flex-row justify-between items-center pt-20 px-[18px] pb-5 rounded-b-[40px] bg-white ">
        <TouchableOpacity
          onPress={handleProfilePress}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          {userProfilePic && typeof userProfilePic === 'string' && userProfilePic.trim() !== '' ? (
            <Image
              source={{ uri: userProfilePic }}
              className="rounded-full"
              style={{ width: 40, height: 40 }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
              <Feather name="user" size={22} color="black" />
            </View>
          )}
        </TouchableOpacity>
        <Text className="font-domine text-2xl text-black">Discover</Text>
        <View className="items-end">
          <Text className="text-[10px] text-gray-400 font-geist">
            v{Constants.expoConfig?.version || '2.2'}
          </Text>
        </View>
      </View>

      <TermsModal
        isVisible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
        onAccept={handleTermsAccept}
      />
    </View>
  );
};

export default NavBar;