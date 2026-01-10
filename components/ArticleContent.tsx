import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue,
} from 'react-native-reanimated';
import { CategoryType } from '@/types/CategoryTypes';
import {
    CATEGORY_STYLES,
    DEFAULT_CATEGORY_STYLE
} from '@/constants/expandedScreenData';

const StyledView = styled(View);

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

interface ArticleContentProps {
    item: any;
    category?: CategoryType;
    commentProgress: SharedValue<number>;
    heroHeightSV: SharedValue<number>; // NEW: animated hero height
    topInset: number; // NEW: safe area top inset
}

/**
 * Article Content Layer - Fades out when comments open
 * 
 * READING: Starts below hero (40% offset), fully visible
 * COMMENTS: Fades out as comments open
 * 
 * paddingTop animated: follows hero height to prevent overlap
 */
const ArticleContent: React.FC<ArticleContentProps> = ({
    item,
    category,
    commentProgress,
    heroHeightSV,
    topInset,
}) => {
    // P0 FIX: Article content fades out when comments open
    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            commentProgress.value,
            [0, 0.4], // STAFF FIX: Widen threshold for smoother arrival
            [1, 0],
            Extrapolate.CLAMP
        );

        const translateY = interpolate(
            commentProgress.value,
            [0, 1],
            [0, 15], // STAFF FIX: 15px glide (was 50px) for "Less Motion"
            Extrapolate.CLAMP
        );

        return {
            paddingTop: 16,
            opacity,
            backgroundColor: 'transparent', // STAFF FIX: Use transparent to avoid layout color jumps
            flex: 1,
            transform: [{ translateY }],
            pointerEvents: commentProgress.value > 0.5 ? 'none' : 'auto',
        };
    }, [commentProgress]);

    // P0 FIX: Moved from inline to fix "View with tag not registered" crash
    const spacerStyle = useAnimatedStyle(() => {
        const topAnchor = interpolate(
            commentProgress.value,
            [0, 1],
            [0, topInset],
            Extrapolate.CLAMP
        );

        return {
            height: topAnchor + heroHeightSV.value
        };
    }, [heroHeightSV, commentProgress, topInset]);

    // P1 FIX: Black title fades out and translates up when comments open
    const titleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            commentProgress.value,
            [0, 0.3],
            [1, 0],
            Extrapolate.CLAMP
        );

        const translateY = interpolate(
            commentProgress.value,
            [0, 0.3],
            [0, -10], // Staff Fix: 10px glide (was 30px)
            Extrapolate.CLAMP
        );

        return {
            opacity,
            transform: [{ translateY }],
        };
    }, [commentProgress]);

    return (
        <Animated.View style={contentStyle}>
            {/* RELATIVE SPACER: This view pushes the text down exactly by the hero height */}
            {/* It shares the same SharedValue as the card, so they are perfectly sync'd */}
            <Animated.View style={spacerStyle} />

            <View style={{ paddingHorizontal: 20 }}>
                <Animated.View style={titleStyle}>
                    <Text className="text-[20px] font-domine mb-[12px]">
                        {item?.title || 'Loading...'}
                    </Text>
                </Animated.View>
                <Text className="font-geist font-light mb-4 text-[16px] leading-6">
                    {item?.summary || 'Extracting key insights...'}
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
            </View>
        </Animated.View>
    );
};

export default ArticleContent;
