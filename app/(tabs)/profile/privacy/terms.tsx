import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity,SafeAreaView } from 'react-native'
import { Feather } from '@expo/vector-icons';
import { router, Href } from 'expo-router';


const terms = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-domine">Terms & Conditions</Text>
        <View className="w-8" />
      </View>
    </SafeAreaView>
  )
}

export default terms