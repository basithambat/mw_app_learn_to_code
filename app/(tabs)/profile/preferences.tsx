import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert, Animated } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { apiGetCategoriesWithPreferences, apiUpdateUserPreference } from '@/api/apiCategories';
import { ProfileApi } from '@/api/apiProfile';
import { useDispatch, useSelector } from 'react-redux';
import { setUserPreferredCategories, userPreferredCategoriesDataSelector } from '@/redux/slice/categorySlice';
import { CategoryType } from '@/types/CategoryTypes';
import { AuthPayload } from '@/types/UserTypes';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import CategoryIcon from '@/components/CategoryIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PreferencesScreen = () => {

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  const categoriesData: any = useSelector(userPreferredCategoriesDataSelector);

  const loggedInUserData: AuthPayload | null = useSelector(loggedInUserDataSelector);

  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);

  const toggleCategory = (id: any) => {
    // Update the `isPreferred` flag in categoriesData (Note: this won't trigger re-render since we're not updating the Redux store here)
    const updatedCategories = categoriesData.map((category: CategoryType) =>
      category.id === id
        ? { ...category, isPreferred: !category.isPreferred }
        : category
    );

    // Optionally, you can dispatch the updated categories to Redux if you want to store this updated state globally
    dispatch(setUserPreferredCategories(updatedCategories));

    setSelectedCategories((prevSelected: any) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item: string) => item !== id) // Remove if already selected
        : [...prevSelected, id] // Add if not selected
    );
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<CategoryType>) => {
    return (
      <ScaleDecorator>
        <View
          style={{
            backgroundColor: isActive ? '#E5E7EB' : '#F6F7F9',
            borderRadius: 12,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            height: 64,
            paddingHorizontal: 4,
          }}
          className={isActive ? 'shadow-lg' : ''}
        >
          {/* 1. Checkbox Area (Pinned Left) */}
          <TouchableOpacity
            onPress={() => toggleCategory(item.id)}
            style={{ width: 50, height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <View
              className="w-5 h-5 rounded-full items-center justify-center"
              style={item.isPreferred ? { backgroundColor: '#35B267' } : { borderWidth: 1, borderColor: '#000000', opacity: 0.3 }}
            >
              {item.isPreferred && <Feather name="check" size={12} color="white" />}
            </View>
          </TouchableOpacity>

          {/* 2. Content Area (Visual Only) */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <CategoryIcon
              categoryId={
                item.icon_url ||
                (item as any)?.category_icon ||
                item.id ||
                'all'
              }
              size={28}
            />
            <Text className="text-[17px] font-domine ml-3 text-[#111]">{item.name}</Text>
          </View>

          {/* 3. Drag Handle (Immediate Activation) */}
          <TouchableOpacity
            onPressIn={drag}
            style={{ width: 60, height: '100%', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}
          >
            <Feather name="menu" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </ScaleDecorator>
    );
  };


  const ThreeDotsLoadingIndicator = () => {
    // Create animated values for each dot
    const animations = [1, 2, 3].map(() => new Animated.Value(1));

    useEffect(() => {
      const sequence = animations.map((value, index) =>
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.loop(
            Animated.sequence([
              Animated.timing(value, {
                toValue: 0.3,
                duration: 700,
                useNativeDriver: true,
              }),
              Animated.timing(value, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
              }),
            ])
          ),
        ])
      );

      Animated.parallel(sequence).start();
    }, []);

    return (
      <View className="flex-row items-center justify-center space-x-1">
        {animations.map((animation, index) => (
          <Animated.View
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-white"
            style={{
              opacity: animation
            }}
          />
        ))}
      </View>
    );
  };
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const userId = loggedInUserData?.user.id;
      if (!userId) {
        throw new Error('User ID is required');
      }
      const res = await apiUpdateUserPreference(selectedCategories, userId);
      if (res.status === 200) {
        const apiRes = await apiGetCategoriesWithPreferences(userId);
        if (apiRes) {
          dispatch(setUserPreferredCategories(apiRes));
          setSelectedCategories(
            apiRes
              .filter((category: CategoryType) => category.isPreferred)
              .map((category: CategoryType) => category.id)
          );
        }
        Alert.alert(
          'Success!',
          'Your preferences for Category have been successfully updated.',
          [{ text: 'OK', onPress: () => router.push('/discoverScreens') }],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const userId = loggedInUserData?.user.id; // Ensure this exists
        if (userId) {
          const apiRes = await apiGetCategoriesWithPreferences(userId);
          if (apiRes) {
            // Dispatch categories to Redux store
            dispatch(setUserPreferredCategories(apiRes));

            // Set the selected categories based on `isPreferred` flag
            setSelectedCategories(
              apiRes
                .filter((category: CategoryType) => category.isPreferred)
                .map((category: CategoryType) => category.id)
            );
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loggedInUserData?.user.id, dispatch]);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-domine text-center flex-1">Preferences</Text>
        <View className="w-10" />
      </View>

      {(!categoriesData && isLoading || categoriesData.length === 0) ?
        <View className="flex-1 items-center justify-center">
          {/* Re-using the premium three dots if available or standard with better styling */}
          <ActivityIndicator size="large" color="#000000" />
        </View>
        :
        <DraggableFlatList
          data={categoriesData}
          onDragEnd={({ data }) => {
            // Update local state when drag ends
            dispatch(setUserPreferredCategories(data));
            // Update selected categories based on new order
            setSelectedCategories(
              data
                .filter((category: CategoryType) => category.isPreferred)
                .map((category: CategoryType) => category.id)
            );
          }}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          containerStyle={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListHeaderComponent={
            <Text className="text-gray-500 text-[14px] font-geist px-0 pb-7">
              You'll see more news from your selected categories and less from others. Drag the handle on the right to prioritize news and refresh your feed.
            </Text>
          }
        />

      }

      {/* Save Button */}
      <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16, paddingTop: 16 }}>
        <TouchableOpacity
          className="bg-black rounded-lg py-4"
          onPress={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <ThreeDotsLoadingIndicator />
          ) : (
            <Text className="text-white text-center font-medium text-lg">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreferencesScreen;