"use client"

import { CategoryType } from '@/types/CategoryTypes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, RefreshControl, ScrollView } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
import CategoryArticles from './CategoryArticles';
import { getCategories } from '@/api/apiCategories';
import Loader from '../loader';
import { Text, TouchableOpacity } from 'react-native';
import { logger } from '@/utils/logger';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    const fetchCategories = useCallback(async (signal?: AbortSignal) => {
        const { from, to } = getLast48HoursRange();
        const userId: string | undefined = loggedInUserData?.user?.id;
        logger.info('Fetching categories for userId:', userId || 'guest');

        if (!refreshing) setLoading(true);
        setError(null);

        try {
            const response = await getCategories(from, to, userId);

            // Check if component is still mounted via signal
            if (signal?.aborted) return;

            const categoriesWithIndex = response.map((category: Omit<CategoryType, 'index'>, idx: number) => ({
                ...category,
                index: Number(idx)
            }));
            setCategories(categoriesWithIndex);
        } catch (err: any) {
            if (signal?.aborted) return;
            console.error("Error fetching categories:", err);
            setError(err.message || "Failed to load discoveries. Please check your connection.");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [location, userPreferredCategories, loggedInUserData?.user?.id, refreshing]);

    useEffect(() => {
        const controller = new AbortController();
        fetchCategories(controller.signal);

        return () => {
            controller.abort();
        };
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
                {loading && !refreshing ? (
                    <View style={{ height: 400, justifyContent: 'center', alignItems: 'center' }}>
                        <Loader />
                    </View>
                ) : error ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>{error}</Text>
                        <TouchableOpacity
                            onPress={() => onRefresh()}
                            style={{ padding: 12, backgroundColor: '#05E1D7', borderRadius: 8 }}
                        >
                            <Text style={{ fontWeight: 'bold' }}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : categories.length === 0 ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ textAlign: 'center', color: '#666' }}>No stories found for the last 48 hours.</Text>
                        <TouchableOpacity
                            onPress={() => onRefresh()}
                            style={{ marginTop: 20, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 }}
                        >
                            <Text>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    categories.map((category: CategoryType, index: number) => (
                        <CategoryArticles
                            category={category}
                            key={`${category.id}-${refreshKey}`}
                        />
                    ))
                )}
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