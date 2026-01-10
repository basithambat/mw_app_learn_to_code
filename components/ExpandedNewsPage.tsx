import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import Animated, {
    useAnimatedStyle,
    SharedValue,
} from 'react-native-reanimated';
import { Category as CategoryType } from '@/types/CategoryTypes';
import {
    SCREEN_DIMENSIONS,
    IMAGE_WRAPPER_STYLE,
    IMAGE_STYLE,
    GRADIENT_STYLE,
    CATEGORY_STYLES,
    DEFAULT_CATEGORY_STYLE
} from '@/constants/expandedScreenData';

const StyledView = styled(View);
const StyledImage = styled(Image);

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

interface ExpandedNewsPageProps {
    item: any;
    category?: CategoryType;
    mode: 'reading' | 'comments' | 'dismissing';
    // SharedValues from parent hook
    commentProgress: SharedValue<number>;
    dismissY: SharedValue<number>;
}

/**
 * Individual article page component for FlatList.
 * Receives SharedValues from parent and defines its own animated styles.
 * NO hooks inside renderItem - all hooks at component top-level.
 */
const ExpandedNewsPage: React.FC<ExpandedNewsPageProps> = ({
    item,
    category,
    mode,
    commentProgress,
    dismissY,
}) => {
    // Define animated styles at component top-level (NOT in renderItem)
    const imageWrapperStyle = {
        ...IMAGE_WRAPPER_STYLE,
        borderBottomRightRadius: mode === 'comments' ? 20 : 0,
        borderBottomLeftRadius: mode === 'comments' ? 20 : 0,
    };

    // Animated styles derived from SharedValues
    const imageAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            transform: [
                { scale: 1 - commentProgress.value * 0.1 }, // Shrink slightly when comments open
            ],
        };
    }, [commentProgress]);

    const gradientAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            opacity: 1 - commentProgress.value * 0.6,
        };
    }, [commentProgress]);

    const titleAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            opacity: commentProgress.value, // Fade in when comments open
            transform: [
                { translateY: -10 + commentProgress.value * 10 },
            ],
        };
    }, [commentProgress]);

    const dragIndicatorAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            opacity: commentProgress.value,
        };
    }, [commentProgress]);

    const contentAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            opacity: 1 - commentProgress.value, // Fade out content when comments open
            transform: [
                { translateY: -commentProgress.value * 20 },
            ],
        };
    }, [commentProgress]);

    return (
        <Animated.View
            style={{
                width: SCREEN_DIMENSIONS.width,
                backgroundColor: mode === 'comments' ? '#F3F4F6' : 'white',
            }}
            collapsable={false}
        >
            {/* Image Section */}
            <Animated.View style={[imageWrapperStyle, imageAnimatedStyle]}>
                {item.image_url ? (
                    <StyledImage
                        source={{ uri: item.image_url }}
                        style={IMAGE_STYLE}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[IMAGE_STYLE, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#9CA3AF', fontSize: 16 }}>No Image</Text>
                    </View>
                )}

                {/* Gradient Overlay */}
                <Animated.View style={[GRADIENT_STYLE, gradientAnimatedStyle]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={{ flex: 1 }}
                    />
                </Animated.View>

                {/* Title Over Image (visible in comments mode) */}
                <Animated.View style={[
                    {
                        position: 'absolute',
                        bottom: 32,
                        left: 20,
                        right: 20,
                    },
                    titleAnimatedStyle
                ]}>
                    {mode === 'comments' && (
                        <Text className="text-[22px] font-domine text-white">
                            {item.title}
                        </Text>
                    )}
                </Animated.View>

                {/* Drag Indicator (visible in comments mode) */}
                <Animated.View style={[
                    {
                        position: 'absolute',
                        bottom: 12,
                        alignSelf: 'center',
                    },
                    dragIndicatorAnimatedStyle
                ]}>
                    {mode === 'comments' && (
                        <View className='h-[4px] w-[24px] rounded-full bg-[#FFFFFF]/20' />
                    )}
                </Animated.View>
            </Animated.View>

            {/* Content Section (title, summary, category) */}
            <Animated.View style={contentAnimatedStyle}>
                <StyledView className="p-[16px]">
                    <Text className="text-[20px] font-domine mb-[12px]">
                        {item.title}
                    </Text>
                    <Text className="font-geist font-light mb-4 text-[16px] leading-6">
                        {item.summary}
                    </Text>

                    {category && (
                        <View
                            className={getCategoryStyleClasses(category.name).container}
                            style={getCategoryStyleClasses(category.name).style}
                        >
                            <Text
                                className={getCategoryStyleClasses(category.name).text}
                                style={getCategoryStyleClasses(category.name).textStyle}
                            >
                                {category.name}
                            </Text>
                        </View>
                    )}
                </StyledView>
            </Animated.View>
        </Animated.View>
    );
};

export default ExpandedNewsPage;
