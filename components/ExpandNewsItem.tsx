import { useExpandedArticleGestures } from '@/hooks/useExpandedArticleGestures';
import { useKeyboardController } from '@/hooks/useKeyboardController';
import { LAYOUT, ANIMATION } from '@/constants/layout';
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    Platform,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    useDerivedValue,
    interpolate,
    Extrapolate,
    useAnimatedScrollHandler,
} from 'react-native-reanimated';
import CommentSectionModal from '@/components/comment/commentSectionModal';
import HeroCard from '@/components/HeroCard';
import ArticleContent from '@/components/ArticleContent';
import { getAllCategories } from '@/api/apiCategories';
import { CategoryType } from '@/types/CategoryTypes';
import { SCREEN_DIMENSIONS } from '@/constants/expandedScreenData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExpandNewsItemProps {
    items: any[];
    initialArticleId: number | string;
    isVisible: boolean;
    onClose: () => void;
}

const ExpandNewsItem: React.FC<ExpandNewsItemProps> = ({
    items,
    initialArticleId,
    isVisible,
    onClose
}) => {
    const flatListRef = useRef<FlatList>(null);
    const [categories, setCategories] = useState<CategoryType[]>([]);

    // Use production-grade keyboard controller (NO FLICKER)
    const {
        keyboardVisibleSV,
        keyboardHeightSV,
        keyboardProgress,
        keyboardHeightJS,
        isKeyboardVisibleJS,
    } = useKeyboardController();

    const { top, bottom } = useSafeAreaInsets();
    // Use unified gesture hook - single source of truth
    const {
        mode,
        verticalPanGesture,
        containerStyle,
        // dimStyle, // REMOVED - we define our own based on uiStateSV
        openComments,
        closeComments,
        dismissDetail,
        commentsScrollY,
        commentProgress,
        dismissY,
    } = useExpandedArticleGestures({
        onDismiss: onClose,
        isWritingSV: keyboardVisibleSV, // PRIORITY FIX
    });

    const [activeArticle, setActiveArticle] = useState(initialArticleId);

    // Calculate initial index based on the ID
    const initialIndex = useMemo(() => {
        const index = items.findIndex((item: any) => item.id == initialArticleId);
        return index >= 0 ? index : 0;
    }, [items, initialArticleId]);

    const currentIndexRef = useRef(initialIndex);

    // Get current item
    const currentItem = useMemo(() => {
        const index = items.findIndex((item: any) => item.id === activeArticle);
        return items[index >= 0 ? index : 0];
    }, [items, activeArticle]);

    // Get current category
    const currentCategory = useMemo(() => {
        return categories.find((cat: CategoryType) => cat.id === currentItem?.category_id);
    }, [categories, currentItem]);

    // MANDATORY: Hero height as DERIVED value (pure interpolation - OK)
    const heroHeightSV = useDerivedValue(() => {
        return interpolate(
            commentProgress.value,
            [0, 1],
            [LAYOUT.HERO_READING_HEIGHT, LAYOUT.HERO_COMMENTS_HEIGHT],
            Extrapolate.CLAMP
        );
    }, [commentProgress]);

    // Track article scroll for gesture gating
    const articleScrollY = useSharedValue(0);

    // Airbnb Fix: Stable writing lift (0 -> 1) controlled by keyboardVisibleSV
    // This removes jitter and coupling to raw pixel height during the transition.
    const writingLiftSV = useDerivedValue(() => {
        return withTiming(keyboardVisibleSV.value, { duration: 200 });
    });

    // Hero layer style - uses writingLiftSV for stable layer depth
    const heroLayerStyle = useAnimatedStyle(() => {
        const isWriting = keyboardVisibleSV.value === 1;

        // NEW: Core translateY logic for the top anchor
        // This replaces the "top" property animation which causes seams.
        const topAnchorY = interpolate(
            commentProgress.value,
            [0, 1],
            [0, top],
            Extrapolate.CLAMP
        );

        // Parallax scroll offset
        const scrollOffset = interpolate(
            commentProgress.value,
            [0, 1],
            [-articleScrollY.value, 0],
            Extrapolate.CLAMP
        );

        return {
            position: 'absolute' as const,
            top: 0, // FIXED TOP
            left: 0,
            right: 0,
            // Stable zIndex based on visibility state (no flicker)
            zIndex: isWriting ? 10 : 40,
            elevation: isWriting ? 10 : 40,
            overflow: 'hidden' as const,
            pointerEvents: isWriting ? 'none' : 'auto',
            transform: [
                { translateY: scrollOffset + dismissY.value }
            ]
        };
    }, [commentProgress, articleScrollY, top, dismissY, keyboardVisibleSV]);

    // Sheet layer style - NOW A STATIC FULL-SCREEN MASK
    const sheetLayerStyle = useAnimatedStyle(() => {
        const isWriting = keyboardVisibleSV.value === 1;
        return {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            // Stable layering based on visibility state
            zIndex: isWriting ? 50 : 20,
            elevation: isWriting ? 50 : 0,
            pointerEvents: mode === 'comments' ? 'auto' : 'none',
        };
    }, [mode, keyboardVisibleSV]);

    // NEW: Content-only translation to preserve the physical floor for the composer
    const sheetContentTranslateStyle = useAnimatedStyle(() => {
        // 1. Core Docked Position (interpolated from closed to open)
        const progressTop = interpolate(
            commentProgress.value,
            [0, 1],
            [SCREEN_HEIGHT, LAYOUT.HERO_COMMENTS_HEIGHT + top],
            Extrapolate.CLAMP
        );

        // 2. Writing Offset: Smoothly lifts the sheet using writingLiftSV
        // This decouples the movement from raw keyboard height jitter.
        const finalTranslate = progressTop * (1 - writingLiftSV.value);

        return {
            flex: 1,
            backgroundColor: '#F3F4F6',
            // Radius only applies during Writing mode (0 in Docked)
            borderTopLeftRadius: writingLiftSV.value * 22,
            borderTopRightRadius: writingLiftSV.value * 22,
            overflow: 'hidden' as const,
            transform: [{ translateY: finalTranslate }]
        };
    }, [top, commentProgress, writingLiftSV]);

    // Re-implement Dim Style for the Writing state
    const dimLayerStyle = useAnimatedStyle(() => {
        return {
            opacity: writingLiftSV.value * 0.85,
            backgroundColor: 'black',
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 45, // Between hero (40) and sheet (50)
            pointerEvents: 'none' as const,
        };
    }, [writingLiftSV]);

    // Reset when component becomes visible
    useEffect(() => {
        if (!isVisible) {
            return;
        }

        currentIndexRef.current = initialIndex;
        setActiveArticle(initialArticleId);

        if (flatListRef.current) {
            const scrollToCorrectPosition = () => {
                try {
                    flatListRef.current?.scrollToIndex({
                        index: initialIndex,
                        animated: false
                    });
                } catch (error) {
                    try {
                        flatListRef.current?.scrollToOffset({
                            offset: initialIndex * SCREEN_DIMENSIONS.width,
                            animated: false
                        });
                    } catch (offsetError) {
                        setTimeout(() => {
                            flatListRef.current?.scrollToOffset({
                                offset: initialIndex * SCREEN_DIMENSIONS.width,
                                animated: false
                            });
                        }, 100);
                    }
                }
            };

            requestAnimationFrame(() => {
                scrollToCorrectPosition();
                setTimeout(scrollToCorrectPosition, 100);
            });
        }
    }, [initialArticleId, initialIndex, isVisible]);

    // Fetch categories
    useEffect(() => {
        (async () => {
            try {
                const apiRes = await getAllCategories();
                if (apiRes) {
                    setCategories(apiRes);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        })();
    }, [])

        ;

    // Android back button handler
    useEffect(() => {
        const backHandler = require('react-native').BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (mode === 'comments') {
                    closeComments();
                    return true;
                } else if (mode === 'reading') {
                    return false;
                }
                return false;
            }
        );

        return () => backHandler.remove();
    }, [mode, closeComments]);

    // Handle FlatList scrolling (article paging)
    const handleScroll = useCallback((event: any) => {
        if (!isVisible) return;

        const offsetX = event.nativeEvent.contentOffset.x;
        const slideIndex = Math.round(offsetX / SCREEN_DIMENSIONS.width);
        const validIndex = Math.max(0, Math.min(slideIndex, items.length - 1));

        if (validIndex !== currentIndexRef.current) {
            currentIndexRef.current = validIndex;
            if (items[validIndex]) {
                setActiveArticle(items[validIndex].id);
            }
        }
    }, [items, isVisible]);

    // FlatList renderItem - invisible spacers for horizontal paging
    const renderScreen = useCallback(({ item }: { item: any }) => {
        return <View style={{ width: SCREEN_DIMENSIONS.width }} />;
    }, []);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: SCREEN_DIMENSIONS.width,
        offset: SCREEN_DIMENSIONS.width * index,
        index,
    }), []);

    return (
        <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
            <GestureDetector gesture={verticalPanGesture}>
                <View style={{ flex: 1 }}>
                    {/* PLANE 1: ARTICLE CONTENT (Text and Scroll) */}
                    <Animated.View style={[{ flex: 1, zIndex: 1, backgroundColor: '#F3F4F6' }, containerStyle]}>
                        <Animated.ScrollView
                            scrollEnabled={mode === 'reading'}
                            showsVerticalScrollIndicator={false}
                            onScroll={useAnimatedScrollHandler({
                                onScroll: (event) => {
                                    articleScrollY.value = event.contentOffset.y;
                                }
                            })}
                            scrollEventThrottle={16}
                            style={{ flex: 1, backgroundColor: '#F3F4F6' }}
                            contentContainerStyle={{ backgroundColor: '#F3F4F6' }}
                        >
                            <ArticleContent
                                item={currentItem}
                                category={currentCategory}
                                commentProgress={commentProgress}
                                heroHeightSV={heroHeightSV}
                                topInset={top}
                            />
                        </Animated.ScrollView>

                        {/* Pagination Indicators - anchored to reading mode container */}
                        {mode === 'reading' && (
                            <View style={{
                                position: 'absolute',
                                top: 10,
                                left: 0,
                                right: 0,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                paddingHorizontal: 20,
                                gap: 4,
                                zIndex: 10,
                            }}>
                                {items.map((_, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            flex: 1,
                                            height: 2,
                                            backgroundColor: currentIndexRef.current === index
                                                ? 'white'
                                                : 'rgba(255,255,255,0.3)',
                                            borderRadius: 2,
                                        }}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Up Arrow Button */}
                        {mode === 'reading' && (
                            <TouchableOpacity
                                onPress={openComments}
                                style={{
                                    position: 'absolute',
                                    bottom: 24,
                                    alignSelf: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    borderRadius: 24,
                                    padding: 12,
                                    zIndex: 10,
                                }}
                            >
                                <AntDesign name="up" size={20} color="white" />
                            </TouchableOpacity>
                        )}

                        {/* Invisible FlatList for horizontal paging only */}
                        <View style={{ position: 'absolute', opacity: 0, pointerEvents: mode === 'reading' ? 'auto' : 'none' }}>
                            <FlatList
                                ref={flatListRef}
                                data={items}
                                renderItem={renderScreen}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                getItemLayout={getItemLayout}
                                onMomentumScrollEnd={handleScroll}
                                initialScrollIndex={initialIndex}
                                scrollEventThrottle={16}
                                scrollEnabled={mode === 'reading' && isVisible}
                                decelerationRate="fast"
                                snapToInterval={SCREEN_DIMENSIONS.width}
                                snapToAlignment='center'
                                removeClippedSubviews={Platform.OS === 'android'}
                                bounces={false}
                                windowSize={3}
                                initialNumToRender={1}
                            />
                        </View>
                    </Animated.View>

                    {/* AIRBNB DIM LAYER: Only dims when writingLiftSV > 0 */}
                    <Animated.View style={dimLayerStyle} />

                    {/* PLANE 2: COMMENTS SHEET (Isolation) */}
                    <Animated.View style={[sheetLayerStyle]}>
                        <CommentSectionModal
                            postId={activeArticle.toString()}
                            isVisible={mode === 'comments'}
                            onClose={closeComments}
                            commentsScrollY={commentsScrollY}
                            keyboardHeight={keyboardHeightJS}
                            keyboardHeightSV={keyboardHeightSV}
                            contentTranslateStyle={sheetContentTranslateStyle}
                        />
                    </Animated.View>

                    {/* PLANE 3: HERO CARD (Persistent Top layer) */}
                    <Animated.View style={[heroLayerStyle]}>
                        <HeroCard
                            item={currentItem}
                            commentProgress={commentProgress}
                        />
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
};

export default ExpandNewsItem;