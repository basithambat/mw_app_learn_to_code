import React, { useCallback, useEffect, useState } from 'react'
import { Image, Platform, StyleSheet, useWindowDimensions, View } from 'react-native'
import { CategoryType } from '@/types/CategoryTypes';
import { Text } from 'react-native';
import { Card } from '../CardAnimation';
import { useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { getAllArticlesByCategories } from '@/api/apiArticles';
import CategoryIcon from '../CategoryIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardStackPill } from './CardStackPill';
// import {
//     automobile, breakingNews, business, curatedForYou, entertainment, health,
//     internationalNews, lifestyle, opinions, politics, science, sports, startup, technology,
//     travel, world, finance
// } from '@/assets';
import {getLast48HoursRange } from '@/utils/DataAndTimeHelper';

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
    const [consumedArticleIds, setConsumedArticleIds] = useState<Set<number>>(new Set());
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const isTablet = SCREEN_WIDTH >= 768;

    const activeIndex = useSharedValue(0);
    const translateX = useSharedValue(0);
    const router = useRouter();

    // Storage key for consumed articles
    const CONSUMED_STORAGE_KEY = `consumed_articles_${category.id}`;

    // Mark article as consumed
    const markAsConsumed = useCallback(async (articleId: number) => {
        try {
            setConsumedArticleIds((prev) => {
                const newSet = new Set(prev);
                newSet.add(articleId);
                // Save to storage
                AsyncStorage.setItem(CONSUMED_STORAGE_KEY, JSON.stringify(Array.from(newSet))).catch(console.error);
                return newSet;
            });
        } catch (error) {
            console.log("Error marking article as consumed:", error);
        }
    }, [CONSUMED_STORAGE_KEY]);

    const handleSwipe = useCallback((swipedArticle: any, direction: 'left' | 'right') => {
        try {
            // Mark as consumed when swiped
            markAsConsumed(swipedArticle.id);
            
            setArticles((prevData): any => {
                const newData = prevData.filter((article: any) => article.id !== swipedArticle.id);
                newData.push(swipedArticle);
                return newData;
            });
        } catch (error) {
            console.log("error: ", error);
        }
    }, [markAsConsumed]);

    const handleItemPress = useCallback((categoryId: any, itemId: number) => {
        // Mark as consumed when opened
        markAsConsumed(itemId);
        
        router.push({
            pathname: '/(news)/[slug]',
            params: {
                slug: itemId.toString(),
                categoryId: categoryId.toString(),
            }
        });
    }, [router, markAsConsumed]);

    // Load consumed articles from storage
    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(CONSUMED_STORAGE_KEY);
                if (stored) {
                    const consumedIds = JSON.parse(stored) as number[];
                    setConsumedArticleIds(new Set(consumedIds));
                }
            } catch (error) {
                console.log("Error loading consumed articles:", error);
            }
        })();
    }, [CONSUMED_STORAGE_KEY]);

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

    // Calculate card dimensions
    const CARD_WIDTH = SCREEN_WIDTH * 0.75;
    const CARD_HEIGHT = CARD_WIDTH * (320 / 273);
    
    // Calculate stack dimensions - Instagram-style: minimal, precise spacing
    const getStackDimensions = () => {
        const visibleArticlesCount = isTablet ? 4 : 3;
        
        // Calculate only the essential card extension from transforms
        // Instagram approach: calculate exact extension, add minimal safety buffer
        const maxHorizontalOffset = (visibleArticlesCount - 1) * 20; // Max stack offset
        const cardDiagonal = Math.sqrt(CARD_WIDTH * CARD_WIDTH + CARD_HEIGHT * CARD_HEIGHT);
        const rotationExtension = Math.sin(10 * Math.PI / 180) * cardDiagonal * 0.3; // Conservative rotation estimate
        
        // Minimal extension calculation - only what's needed
        const totalExtension = maxHorizontalOffset + rotationExtension;
        
        // Container height: card + extension + minimal buffer (Instagram-style tight spacing)
        const baseContainerHeight = CARD_HEIGHT + totalExtension + 8; // Just 8px buffer
        
        if (isTablet) {
            return {
                containerHeight: Math.max(1020, baseContainerHeight),
                containerPadding: 0,
                marginBottom: 12 // Reduced gap between categories (was 24px)
            };
        }
        
        // Mobile: minimal, precise spacing
        const mobileContainerHeight = Platform.OS === 'ios' 
            ? Math.max(388, baseContainerHeight)
            : Math.max(260, baseContainerHeight);
            
        return {
            containerHeight: mobileContainerHeight,
            containerPadding: 0,
            marginBottom: 8 // Reduced gap between categories (was 20px)
        };
    };

    const onSwipeCard = useCallback((item: any, direction: 'left' | 'right') => {
        handleSwipe(item, direction);
        translateX.value = 0;
        activeIndex.value = 0;
    }, [handleSwipe, translateX, activeIndex]);

    return (
        <View style={{ 
    const totalCards = articles.length;
    const consumedCards = Array.from(consumedArticleIds).filter(id => 
        articles.some(article => article.id === id)
    ).length;
    const unconsumedCards = totalCards - consumedCards;
    
    // Instagram-style spacing: minimal, precise
    // Calculate only what's needed to prevent overlap
    const maxCardExtension = (visibleArticles.length - 1) * 20;
    const cardDiagonal = Math.sqrt(CARD_WIDTH * CARD_WIDTH + CARD_HEIGHT * CARD_HEIGHT);
    const rotationExtension = Math.sin(10 * Math.PI / 180) * cardDiagonal * 0.3;
    const categoryHeaderHeight = isTablet ? 44 : 36; // Tight header height
    
    // Tight spacing between category header and cards (Instagram-style)
    const categoryHeaderSpacing = isTablet ? 12 : 8;

    return (
        <View style={{ 
            paddingBottom: 8, // Reduced padding bottom significantly
            paddingTop: 16,
            marginBottom: marginBottom, // Reduced gap between categories
            borderBottomWidth: 0, // Remove border for cleaner look
        }}>
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                paddingLeft: isTablet ? 24 : 16,
                paddingBottom: categoryHeaderSpacing, // Tight spacing
                paddingTop: 4
            }}>
                <View style={{ 
                    width: isTablet ? 32 : 24, 
                    height: isTablet ? 32 : 24, 
                    marginRight: 8, 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <CategoryIcon 
                        categoryId={
                            category?.icon_url || 
                            (category as any)?.category_icon || 
                            category?.id || 
                            'all'
                        } 
                        size={isTablet ? 32 : 24}
                    />
                </View>
                <Text style={{ 
                    fontFamily: 'Domine', 
                    fontSize: isTablet ? 20 : 18 // Slightly smaller
                }}>
                    {category.name}
                </Text>
            </View>
            <View 
                style={[
                    styles.cardContainer,
                    {
                        width: SCREEN_WIDTH,
                        minHeight: containerHeight,
                        paddingTop: visibleArticles.length === 1 ? 12 : 24, // Reduced padding
                        paddingBottom: Math.max(8, rotationExtension + 4), // Minimal bottom padding
                        marginBottom: marginBottom,
                    }
                ]}
                pointerEvents="box-none"
            >
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
                            onSwipe={(direction) => onSwipeCard(item, direction)}
                            onPress={() => handleItemPress(category.id, item.id)}
                        />
                    )
                }).reverse()}
            </View>
            
            {/* Card Stack Progress Pill */}
            {totalCards > 0 && (
                <CardStackPill
                    totalCards={totalCards}
                    consumedCards={consumedCards}
                    unconsumedCards={unconsumedCards}
                />
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
        overflow: 'visible', // Keep visible for card stacking effect
    },
});