import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import { getUserActivities } from '@/api/apiActivity';
import { ActivityTypes } from '@/types/Activity';
import { setUserActivityLogs, UserActivityLogsSelector } from '@/redux/slice/UserActivityLogsSlice';
import { getTimeDifference } from '@/config/momentConfig';

const ActivityScreen = () => {

  const loggedInUserData = useSelector(loggedInUserDataSelector);
  const userActivityLogs = useSelector(UserActivityLogsSelector);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const userId = loggedInUserData?.user.id;
    (async () => {
      try {
        await getUserActivities(userId)
          .then((res: ActivityTypes[]) => {
            dispatch(setUserActivityLogs(res))
          }).catch((error) => {
            throw error
          })
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false)
      }
    })()
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[18px] pb-[32px] ">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-domine">Activity</Text>
        <View className="w-8" />
      </View>

      {/* Section Title */}
      <Text className="text-[16px] font-domine px-4 pb-4">
        News you've commented on
      </Text>

      {/* Loading or Empty Data Check */}
      {isLoading || userActivityLogs.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          {isLoading ? (
            <ActivityIndicator size="large" color="black" />
          ) : (
            <Text className="text-lg text-gray-600">No activity logs available</Text>
          )}
        </View>
      ) : (
        <>
          {/* Activity List */}
          <ScrollView className="flex-1">
            {userActivityLogs.map((activity: ActivityTypes) => {
              const user = activity.user;
              return (
                <View key={activity.id} className="px-4 mb-6">
                  <TouchableOpacity
                    className="flex-row space-x-3 mb-3"
                    onPress={() => {/* Navigate to news article */ }}
                  >
                    <Image
                      source={{ uri: activity.article.image_url }}
                      className="w-10 h-10 rounded-lg"
                      resizeMode="cover"
                    />
                    <Text className="flex-1  font-geist">
                      {activity.article.title}
                    </Text>
                  </TouchableOpacity>

                  {/* Comment Section */}
                  <View className="flex-row items-start ml-[48px]">
                    {/* User Avatar */}
                    {activity.user ? (  // Check if profile pic exists
                      <Image
                        source={{ uri: user.pic }}
                        className="w-8 h-8 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-8 h-8 rounded-full bg-purple-200 items-center justify-center mr-[6px]">
                        <Text className="text-purple-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    {/* Comment Content */}
                    <View className="flex-1 ml-2">
                      <Text className=" font-geist text-[14px] mb-1">{activity.comment}</Text>
                      <Text className="text-gray-500 text-[12px]">{getTimeDifference(activity.updated_at)}</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default ActivityScreen;