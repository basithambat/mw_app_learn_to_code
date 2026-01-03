// components/Navbar/index.tsx
import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import menuIcon from '@/assets/iconMenu.webp';
import { useSelector } from "react-redux";
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import TermsModal from '@/components/t&c';

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
        <TouchableOpacity onPress={handleProfilePress}>
          {userProfilePic ? (  // Check if profile pic exists
            <Image
              source={{ uri: userProfilePic }}
              className="w-[40px] h-[40px] rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Image
              source={menuIcon}
              className="w-[40px] h-[40px]"
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
        <Text className="font-domine text-2xl text-black">Discover</Text>
        <View className="w-9 h-9">
          {/* <Image source={searchIcon} className="w-9 h-9 hidden" resizeMode="contain" /> */}
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