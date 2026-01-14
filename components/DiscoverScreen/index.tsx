"use client"

import { CategoryType } from '@/types/CategoryTypes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, RefreshControl, ScrollView } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
import CategoryArticles from './CategoryArticles';
import { getCategories } from '@/api/apiCategories';
import useLocation from '@/hooks/useLocation';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    interpolate,
    Extrapolate,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { getLast48HoursRange } from '@/utils/DataAndTimeHelper';
import { useSelector } from 'react-redux';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import { userPreferredCategoriesDataSelector } from '@/redux/slice/categorySlice';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const INITIAL_GRADIENT_HEIGHT = 150;
const MAX_PULL_DISTANCE = 220;

const GRADIENT_COLORS = [
    ['rgba(5,225,215,0.6)', 'rgba(5,235,215,0)'],           // Turquoise
    ['rgba(255,105,180,0.6)', 'rgba(255,105,180,0)'],       // Hot Pink
    ['rgba(147,112,219,0.6)', 'rgba(147,112,219,0)'],       // Purple
    ['rgba(255,165,0,0.6)', 'rgba(255,165,0,0)'],           // Orange
    ['rgba(50,205,50,0.6)', 'rgba(50,205,50,0)']            // Lime Green
] as const;

const DEFAULT_GRADIENT = ['rgba(5,225,215,0.6)', 'rgba(5,235,215,0)'];

const DiscoverScreen = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
    const { location, errorMsg } = useLocation();
    const scrollY = useSharedValue(0);
    const isRefreshingValue = useSharedValue(false);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const loggedInUserData = useSelector(loggedInUserDataSelector);
    const userPreferredCategories = useSelector(userPreferredCategoriesDataSelector);

    const getCurrentGradientColors = () => {
        try {
            return GRADIENT_COLORS[currentGradientIndex] || DEFAULT_GRADIENT;
        } catch (error) {
            console.error('Error getting gradient colors:', error);
            return DEFAULT_GRADIENT;
        }
    };

    const fetchCategories = useCallback(async () => {
        const { from, to } = getLast48HoursRange();
        const userId: string = loggedInUserData?.user.id as string;
        try {
            const response = await getCategories(from, to, userId);
            const categoriesWithIndex = response.map((category: Omit<CategoryType, 'index'>, idx: number) => ({
                ...category,
                index: Number(idx)
            }));
            setCategories(categoriesWithIndex);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, [location, userPreferredCategories, loggedInUserData?.user?.id]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setRefreshKey(Date.now());
        await fetchCategories();
        setRefreshing(false);
    }, [fetchCategories]);

    const handleGradientChange = () => {
        setCurrentGradientIndex((prevIndex) => (prevIndex + 1) % GRADIENT_COLORS.length);
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const offsetY = event.contentOffset.y;
            scrollY.value = offsetY;

            if (offsetY < -MAX_PULL_DISTANCE * 0.5) {
                if (!isRefreshingValue.value) {
                    isRefreshingValue.value = true;
                    runOnJS(handleGradientChange)();
                }
            } else if (offsetY >= 0) {
                isRefreshingValue.value = false;
            }
        },
    });

    const gradientStyle = useAnimatedStyle(() => {
        const height = interpolate(
            scrollY.value,
            [-MAX_PULL_DISTANCE, 0],
            [INITIAL_GRADIENT_HEIGHT + MAX_PULL_DISTANCE, INITIAL_GRADIENT_HEIGHT],
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            [-MAX_PULL_DISTANCE, 0],
            [0.8, 0.3],
            Extrapolate.CLAMP
        );

        return {
            height,
            opacity: withTiming(opacity, { duration: 150 }),
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [-MAX_PULL_DISTANCE, 0, INITIAL_GRADIENT_HEIGHT],
                        [0, 0, -INITIAL_GRADIENT_HEIGHT],
                        Extrapolate.CLAMP
                    )
                }
            ],
        };
    });

    const currentGradientColors = getCurrentGradientColors();

    return (
        <View style={styles.container}>
            <View style={styles.gradientContainer}>
                <AnimatedLinearGradient
                    colors={currentGradientColors}
                    style={[styles.gradient, gradientStyle]}
                />
            </View>
            <AnimatedScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollViewContent}
                bounces={true}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#000000" // iOS spinner color
                        colors={['#000000', '#05E1D7']} // Android spinner colors
                        progressBackgroundColor="#ffffff" // Background for Android circle
                        progressViewOffset={88} // Align with content padding
                    />
                }
            >
                {categories.map((category: CategoryType, index: number) => (
                    <CategoryArticles
                        category={category}
                        key={`${category.id}-${refreshKey}`}
                    />
                ))}
            </AnimatedScrollView>
        </View>
    );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 20,
    },
    gradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height: INITIAL_GRADIENT_HEIGHT,
        overflow: 'visible',
    },
    gradient: {
        width: '100%',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingTop: 88,
        zIndex: 50,
    }
});