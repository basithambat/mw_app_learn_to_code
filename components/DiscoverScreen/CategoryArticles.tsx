import React, { useCallback, useEffect, useState } from 'react'
import { Image, Platform, StyleSheet, useWindowDimensions, View } from 'react-native'
import { CategoryType } from '@/types/CategoryTypes';
import { Text } from 'react-native';
import { Card } from '../CardAnimation';
import { useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { getAllArticlesByCategories } from '@/api/apiArticles';
import CategoryIcon from '@/components/CategoryIcon';
import { getLast48HoursRange } from '@/utils/DataAndTimeHelper';
import Animated, { useAnimatedStyle, withSequence, withSpring } from 'react-native-reanimated';

type CategoryIconKey = 'categoryKey' | string;

// const categoryIcons: Record<CategoryIconKey, any> = {
//     'Automobile': automobile,
//     'Breaking news': breakingNews,
//     'Business': business,
//     'Curated for you': curatedForYou,
//     'Entertainment': entertainment,
//     'Health': health,
//     'International News': internationalNews,
//     'Lifestyle': lifestyle,
//     'Opinions': opinions,
//     'Politics': politics,
//     'Science': science,
//     'Sports': sports,
//     'Technology': technology,
//     'World': world,
//     'Travel': travel,
//     'Startup': startup,
//     'Finance': finance,
// };

const CategoryArticles = ({ category }: { category: CategoryType }) => {
    const [articles, setArticles] = useState<any[]>([])
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const isTablet = SCREEN_WIDTH >= 768;

    const activeIndex = useSharedValue(0);
    const translateX = useSharedValue(0);
    const iconScale = useSharedValue(1);
    const router = useRouter();

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }]
    }));

    const handleSwipe = useCallback((swipedArticle: any, direction: 'left' | 'right') => {
        try {
            // Micro-animation for the category icon
            iconScale.value = withSequence(
                withSpring(1.25, { damping: 10, stiffness: 300 }),
                withSpring(1, { damping: 15, stiffness: 200 })
            );

            setArticles((prevData): any => {
                const newData = prevData.filter((article: any) => article.id !== swipedArticle.id);
                newData.push(swipedArticle);
                return newData;
            });
        } catch (error) {
            console.log("error: ", error);
        }
    }, []);

    const handleItemPress = useCallback((categoryId: any, itemId: number) => {
        router.push({
            pathname: '/(news)/[slug]',
            params: {
                slug: itemId.toString(),
                categoryId: categoryId.toString(),
            }
        });
    }, [router]);

    useEffect(() => {
        (async () => {
            const { from, to } = getLast48HoursRange();
            const categoryId = category.id as string;
            try {
                const response = await getAllArticlesByCategories(categoryId, from, to);
                setArticles(response)
            } catch (error) {
                console.log("error", error);
            }
        })()
    }, []);

    const CARD_WIDTH = SCREEN_WIDTH * 0.75;
    const CARD_HEIGHT = CARD_WIDTH * (320 / 273);

    // Calculate stack dimensions based on device type
    const getStackDimensions = () => {
        if (isTablet) {
            return {
                containerHeight: 1020,
                stackPadding: 560,
                containerPadding: 500
            };
        }
        return {
            containerHeight: CARD_HEIGHT + 40, // Base height on card size + padding
            stackPadding: 10,
            containerPadding: 0
        };
    };

    const { containerHeight, stackPadding, containerPadding } = getStackDimensions();
    const visibleArticles = articles.slice(0, isTablet ? 4 : 3);
    const cardContainerPaddingTop = 20; // Stable padding
    const cardContainerMarginBottom = visibleArticles.length === 1 ? 20 : 40;

    return (
        <View className="pb-0 pt-8 border-b-2 border-[#F3F4F6]">
            {/* Category Header */}
            <View className={`flex-row items-center ${isTablet ? 'pl-[32px]' : 'pl-[16px]'} mb-2`}>
                <Animated.View style={iconAnimatedStyle}>
                    <CategoryIcon
                        categoryId={String(category.id)}
                        size={isTablet ? 36 : 28}
                        style={{ marginRight: 8 }}
                    />
                </Animated.View>
                <Text className={`font-domine ${isTablet ? 'text-[24px]' : 'text-[20px]'}`}>
                    {category.name}
                </Text>
            </View>

            {/* Imaginary/Transparent Boundary Box for the Stack */}
            <View style={[
                styles.cardContainer,
                {
                    width: SCREEN_WIDTH,
                    height: containerHeight,
                    paddingTop: cardContainerPaddingTop,
                }
            ]}>
                {visibleArticles.map((item, itemIndex) => {
                    return (
                        <Card
                            key={item.id}
                            card={{
                                id: item.id,
                                title: item.title,
                                image: item.image_url,
                            }}
                            index={itemIndex}
                            totalCards={visibleArticles.length}
                            activeIndex={activeIndex}
                            translateX={translateX}
                            categoryIndex={category.index}
                            onSwipe={(direction) => {
                                handleSwipe(item, direction);
                                translateX.value = 0;
                                activeIndex.value = 0;
                            }}
                            onPress={() => handleItemPress(category.id, item.id)}
                        />
                    )
                }).reverse()}
            </View>

            {/* Unread count pill below the stack */}
            {articles.length > 0 && (
                <View style={styles.pillContainer}>
                    <View style={styles.pill}>
                        <Text style={styles.pillText}>{articles.length} unread</Text>
                    </View>
                </View>
            )}
        </View>
    )
}

export default CategoryArticles;

const styles = StyleSheet.create({
    cardContainer: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
        overflow: 'visible',
    },
    pillContainer: {
        alignItems: 'center',
        marginTop: -4,
        marginBottom: 32,
    },
    pill: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    pillText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
});