import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue,
    useDerivedValue,
} from 'react-native-reanimated';
import { CategoryType } from '@/types/CategoryTypes';
import {
    SCREEN_DIMENSIONS,
    CATEGORY_STYLES,
    DEFAULT_CATEGORY_STYLE
} from '@/constants/expandedScreenData';

const StyledView = styled(View);
const StyledImage = styled(Image);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const getCategoryStyleClasses = (categoryName: string) => {
    const styles = CATEGORY_STYLES[categoryName] || DEFAULT_CATEGORY_STYLE;
    return {
        container: `mb-4 mr-auto border rounded-full`,
        text: `text-sm px-4 py-1 rounded-full inline-block`,
        style: {
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor,
        },
        textStyle: {
            color: styles.textColor,
        }
    };
};

import { LAYOUT } from '@/constants/layout';

interface HeroCardProps {
    item: any;
    commentProgress: SharedValue<number>;
}

/**
 * Hero Card Layer - Fixed height design
 * 
 * READING: 40% screen height, 100% width
 * COMMENTS_DOCKED: 30% screen height, 94% width, rounded
 * 
 * NO aspectRatio - height is controlled by design tokens
 */
const HeroCard: React.FC<HeroCardProps> = ({ item, commentProgress }) => {
    // Unified radius shared across children for hardened clipping
    const borderRadiusSV = useDerivedValue(() => {
        return interpolate(
            commentProgress.value,
            [0, 1],
            [LAYOUT.HERO_RADIUS_READING, LAYOUT.HERO_RADIUS_COMMENTS],
            Extrapolate.CLAMP
        );
    });

    // Hero card animations - FIXED HEIGHTS
    const heroStyle = useAnimatedStyle(() => {
        const height = interpolate(
            commentProgress.value,
            [0, 1],
            [LAYOUT.HERO_READING_HEIGHT, LAYOUT.HERO_COMMENTS_HEIGHT],
            Extrapolate.CLAMP
        );

        const width = interpolate(
            commentProgress.value,
            [0, 1],
            [LAYOUT.SCREEN_WIDTH, LAYOUT.SCREEN_WIDTH * LAYOUT.HERO_WIDTH_COMMENTS],
            Extrapolate.CLAMP
        );

        return {
            height,
            width,
            alignSelf: 'center' as const,
            borderBottomLeftRadius: borderRadiusSV.value,
            borderBottomRightRadius: borderRadiusSV.value,
            overflow: 'hidden' as const,
            backgroundColor: '#F3F4F6', // Sync background to prevent white ghosting
        };
    }, [commentProgress]);

    // Gradient overlay fade in
    const gradientStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            commentProgress.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP
        );

        return {
            opacity,
            borderBottomLeftRadius: borderRadiusSV.value,
            borderBottomRightRadius: borderRadiusSV.value,
            overflow: 'hidden' as const,
        };
    }, [commentProgress]);

    // Title overlay (only visible when comments open)
    const titleStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            commentProgress.value,
            [0, 1],
            [200, 0],
            Extrapolate.CLAMP
        );
        const opacity = interpolate(
            commentProgress.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateY }],
            opacity,
        };
    }, [commentProgress]);

    // Drag indicator
    const dragIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            commentProgress.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP
        );

        return { opacity };
    }, [commentProgress]);

    // Master clipping container style
    const clippingStyle = useAnimatedStyle(() => {
        return {
            borderBottomLeftRadius: borderRadiusSV.value,
            borderBottomRightRadius: borderRadiusSV.value,
        };
    }, [borderRadiusSV]);

    return (
        <Animated.View style={[{ alignSelf: 'center' }, heroStyle]}>
            {/* MASTER ART BOX: The single point of clipping for Image + Gradient */}
            <Animated.View style={[
                StyleSheet.absoluteFillObject,
                {
                    overflow: 'hidden' as const,
                    backgroundColor: '#F3F4F6', // Grounded gray
                },
                clippingStyle
            ]}>
                {/* 1. Hero Image */}
                {item.image_url ? (
                    <Image
                        source={{ uri: item.image_url }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#9CA3AF', fontSize: 16 }}>No Image</Text>
                    </View>
                )}

                {/* 2. Gradient Overlay - Direct Radius applied to Native Layer */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: LAYOUT.HERO_COMMENTS_HEIGHT * 0.7,
                        zIndex: 1, // Ensure it's above image
                    }}
                >
                    <AnimatedLinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                        style={[StyleSheet.absoluteFillObject, gradientStyle]}
                    />
                </Animated.View>
            </Animated.View>

            {/* Title Overlay (appears when comments open) */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: 32,
                        left: 20,
                        right: 20,
                    },
                    titleStyle
                ]}
            >
                <Text className="text-[22px] font-domine text-white">
                    {item.title}
                </Text>
            </Animated.View>

            {/* Drag Indicator */}
            {/* Drag Indicator - Airbnb Style */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: 8,
                        alignSelf: 'center',
                        zIndex: 40,
                    },
                    dragIndicatorStyle
                ]}
            >
                {/* Thin, subtle gray handle */}
                <View className='h-[4px] w-[32px] rounded-full bg-[#FFFFFF]/40' />
            </Animated.View>
        </Animated.View>
    );
};

export default HeroCard;
