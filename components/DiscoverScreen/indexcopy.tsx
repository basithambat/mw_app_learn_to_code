"use client"

import { CategoryType } from '@/types/CategoryTypes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import CategoryArticles from './CategoryArticles';
import { getCategories } from '@/api/apiCategories';
import useLocation from '@/hooks/useLocation';
import { getLast24HoursRange } from '@/utils/DataAndTimeHelper';
import Animated, { 
    useAnimatedScrollHandler, 
    useAnimatedStyle, 
    useSharedValue,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const INITIAL_GRADIENT_HEIGHT = 150;
const MAX_PULL_DISTANCE = 220;

const DiscoverScreen = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const { location, errorMsg } = useLocation();
    const scrollY = useSharedValue(0);

    useEffect(() => {
        (async () => {
            const { from, to } = getLast24HoursRange();
            try {
                const response = await getCategories(from, to);
                const categoriesWithIndex = response.map((category: Omit<CategoryType, 'index'>, idx: number) => ({
                    ...category,
                    index: Number(idx)
                }));
                setCategories(categoriesWithIndex);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        })();
    }, [location]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
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
            [0.5, 0.3],
            Extrapolate.CLAMP
        );

        return {
            height,
            opacity,
        };
    });

    return (
        <View style={styles.container}>
            <AnimatedLinearGradient
                colors={['rgba(5,225,215,0.7)', 'rgba(5,235,215,0)']}
                style={[styles.gradient, gradientStyle]}
            />
            <AnimatedScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollViewContent}
                bounces={true}
            >
                {categories.map((category: CategoryType) => (
                    <CategoryArticles
                        category={category}
                        key={category.id}
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
    },
    gradient: {
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingTop: 88,
    }
});