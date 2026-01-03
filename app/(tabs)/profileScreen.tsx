import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { router, Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { loggedInUserDataSelector } from "@/redux/slice/userSlice";
import { AuthPayload } from "@/types/UserTypes";
import LottieView from "lottie-react-native";
import { useRef, useState } from "react";
import { deletUser } from "@/api/apiUser";
import GlossyButton from "@/components/glossyButton";

type Route = Href<string>;

const ProfileScreen = () => {
  const loggedInUserData: AuthPayload | null = useSelector(
    loggedInUserDataSelector
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const dispatch = useDispatch();
  const animation = useRef<LottieView>(null);

  const menuItems: Array<{
    title: string;
    icon: any;
    route: Route;
    style: string;
  }> = [
    {
      title: "Profile",
      icon: require("@/assets/images/profileIcons/profile.webp"),
      route: "/(tabs)/profile/profile" as Route,
      style: "font-domine text-[16px]", // Only adding the red text style since the rest is handled in the TouchableOpacity
    },
    {
      title: "Preferences",
      icon: require("@/assets/images/profileIcons/preferences.webp"),
      route: "/(tabs)/profile/preferences" as Route,
      style: "font-domine text-[16px]",
    },
    {
      title: "Activity",
      icon: require("@/assets/images/profileIcons/activity.webp"),
      route: "/(tabs)/profile/activity" as Route,
      style: "font-domine text-[16px]",
    },
    {
      title: "Privacy Settings",
      icon: require("@/assets/images/profileIcons/privacy.webp"),
      route: "/(tabs)/profile/privacy" as Route,
      style: "font-domine text-[16px]",
    },
  ];

  if (!loggedInUserData?.user) {
    router.replace("/(auth)/login" as Route);
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-[16px]">
      <Image
        source={require("@/assets/profileBg.webp")}
        className="absolute w-screen h-[406px]"
        resizeMode="cover"
      />
      <View className="flex-row items-center mt-4 relative">
        <TouchableOpacity
          onPress={router.back}
          className="absolute left-0 top-0 z-10"
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>

    {/* profile pic */}
        <View className="flex-1">
          <View className="items-center mt-[16px] pb-[28px] flex-row justify-center">
            <View className="flex-1 items-center">
              <Image
                source={{ uri: loggedInUserData.user?.pic }}
                className="w-[120px] h-[120px] rounded-full border-white border-[3px]"
                resizeMode="cover"
              />
              <View className="bg-[#868686] px-[1px] py-[1px] rounded-full absolute -bottom-2">
                <GlossyButton />
              </View>
            </View>
          </View>

          <Text className="text-[24px] font-domine text-center">
            {loggedInUserData.user?.name}
          </Text>
        </View>

      </View>

    {/* tabs */}
      <View className="mt-[44px]">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center py-[12px] border-b border-[#F4F5F8] rounded-lg "
            onPress={() => router.push(item.route)}
          >
             {typeof item.icon === 'string' ? (
        <Text className="text-2xl mr-4">{item.icon}</Text>
      ) : (
        <Image 
          source={item.icon} 
          className="w-[24px] h-[24px] mr-4"
          resizeMode="contain"
        />
      )}
            <Text className={`flex-1 text-lg ${item.style}`}>{item.title}</Text>
            <Text className="text-gray-400">→</Text>
          </TouchableOpacity>
        ))}
      </View>

    </SafeAreaView>
  );
};

export default ProfileScreen;
