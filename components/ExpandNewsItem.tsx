import { useExpandedArticleGestures } from '@/hooks/useExpandedArticleGestures';
import { useKeyboardController } from '@/hooks/useKeyboardController';
import { LAYOUT, ANIMATION } from '@/constants/layout';
import { AntDesign } from '@expo/vector-icons';
import Svg, { Rect, G, Path, Defs, ClipPath } from 'react-native-svg';
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
    StyleSheet,
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
import { getIngestionCategories } from '@/api/apiIngestion';
import { CategoryType } from '@/types/CategoryTypes';
import { SCREEN_DIMENSIONS } from '@/constants/expandedScreenData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExpandNewsItemProps {
    items: any[];
    initialArticleId: number | string;
    isVisible: boolean;
    onClose: () => void;
    initialTitle?: string;
    initialImage?: string;
}

// Extracted Component to prevent Invalid Hook Call
const ArticlePageItem = React.memo(({
    item,
    activeArticle,
    mode,
    articleScrollY,
    categories,
    commentProgress,
    heroHeightSV,
    top,
}: {
    item: any;
    activeArticle: number | string;
    mode: string;
    articleScrollY: any;
    categories: CategoryType[];
    commentProgress: any;
    heroHeightSV: any;
    top: number;
}) => {
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            // Only sync scroll Y if this is the active item
            if (item.id === activeArticle) {
                articleScrollY.value = event.contentOffset.y;
            }
        }
    });

    const category = useMemo(() => {
        return categories.find(c => c.id === item.category_id);
    }, [categories, item.category_id]);

    return (
        <View style={{ width: SCREEN_DIMENSIONS.width, flex: 1 }}>
            <Animated.ScrollView
                scrollEnabled={mode === 'reading'}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                style={{ flex: 1 }}
                contentContainerStyle={{ backgroundColor: 'transparent' }}
            >
                <ArticleContent
                    item={item}
                    category={category}
                    commentProgress={commentProgress}
                    heroHeightSV={heroHeightSV}
                    topInset={top}
                />
            </Animated.ScrollView>
        </View>
    );
});

const ExpandNewsItem: React.FC<ExpandNewsItemProps> = ({
    items,
    initialArticleId,
    isVisible,
    onClose,
    initialTitle,
    initialImage
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
    const {
        mode,
        verticalPanGesture,
        containerStyle,
        openComments,
        closeComments,
        dismissDetail,
        commentsScrollY,
        commentProgress,
        dismissY,
    } = useExpandedArticleGestures({
        onDismiss: onClose,
        isWritingSV: keyboardVisibleSV,
    });

    const entranceProgress = useSharedValue(0);
    const [activeArticle, setActiveArticle] = useState(initialArticleId);

    // Calculate initial index based on the ID
    const initialIndex = useMemo(() => {
        const index = items.findIndex((item: any) => item.id == initialArticleId);
        return index >= 0 ? index : 0;
    }, [items, initialArticleId]);

    const currentIndexRef = useRef(initialIndex);

    // Get current item
    const currentItem = useMemo(() => {
        const index = items.findIndex((item: any) => item.id.toString() === activeArticle.toString());
        if (index >= 0) return items[index];

        // If items aren't loaded yet, use the initial metadata passed via route params
        if (initialTitle || initialImage) {
            return {
                id: initialArticleId,
                title: initialTitle,
                image_url: initialImage,
                summary: 'Loading summary...'
            };
        }
        return null;
    }, [items, activeArticle, initialTitle, initialImage]);

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

    // Airbnb Anchor Logic: Define the "Hard Top" for the Card
    const HERO_TOP = top + 12; // Staff Fix: 12px buffer (was 2px) for radii visibility

    // Hero layer style - uses writingLiftSV for stable layer depth
    const heroLayerStyle = useAnimatedStyle(() => {
        const isWriting = keyboardVisibleSV.value === 1;

        // NEW: Core translateY logic for the top anchor
        // Base position is HERO_TOP.
        // Reading (0) -> needs to be at 0 onscreen -> offset = -HERO_TOP.
        // Docked (1) -> needs to be at HERO_TOP onscreen -> offset = 0.
        const topAnchorY = interpolate(
            commentProgress.value,
            [0, 1],
            [-HERO_TOP, 0],
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
            top: HERO_TOP, // FIXED at Safe Area + Gap
            left: 0,
            right: 0,
            // Stable zIndex based on visibility state (no flicker)
            zIndex: isWriting ? 10 : 40,
            elevation: isWriting ? 10 : 40,
            overflow: 'hidden' as const,
            pointerEvents: isWriting ? 'none' : 'auto',
            transform: [
                // P0 FIX: Add topAnchorY to prevent drift into status bar
                { translateY: topAnchorY + scrollOffset + dismissY.value }
            ]
        };
    }, [commentProgress, articleScrollY, top, dismissY, keyboardVisibleSV]);

    // Sheet layer style - NOW A STATIC FULL-SCREEN MASK
    const sheetLayerStyle = useAnimatedStyle(() => {
        const isWriting = keyboardVisibleSV.value === 1;
        // P0 FIX: Layer opacity - ensure it's completely hidden in reading mode
        const opacity = interpolate(commentProgress.value, [0, 0.1], [0, 1], Extrapolate.CLAMP);
        // P0 FIX: Strictly use activeModeSV for pointer events to prevent "stuck" touches
        const isCommentsActive = commentProgress.value > 0.5;

        return {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            opacity, // STAFF FIX: Zero opacity in reading mode
            // Stable layering based on visibility state
            zIndex: isWriting ? 50 : 20,
            elevation: isWriting ? 50 : 0,
            pointerEvents: (isCommentsActive) ? 'auto' : 'none',
        };
    }, [commentProgress, keyboardVisibleSV]);

    // NEW: Content-only translation to preserve the physical floor for the composer
    const sheetContentTranslateStyle = useAnimatedStyle(() => {
        // 1. Core Docked Position (interpolated from closed to open)
        const progressTop = interpolate(
            commentProgress.value,
            [0, 1],
            [SCREEN_HEIGHT, LAYOUT.HERO_COMMENTS_HEIGHT + HERO_TOP],
            Extrapolate.CLAMP
        );

        // 2. Writing Offset: Smoothly lifts the sheet using writingLiftSV
        const finalTranslate = progressTop * (1 - writingLiftSV.value);

        return {
            flex: 1,
            backgroundColor: '#F3F4F6',
            borderTopLeftRadius: writingLiftSV.value * 22,
            borderTopRightRadius: writingLiftSV.value * 22,
            overflow: 'hidden' as const,
            transform: [{ translateY: finalTranslate }],
            // STAFF FIX: High-threshold ghosting (0.99) to hide layout-driven realignment jitter
            opacity: interpolate(commentProgress.value, [0.99, 1], [0, 1], Extrapolate.CLAMP),
        };
    }, [top, commentProgress, writingLiftSV, HERO_TOP]);

    // Backdrop style (orchestrated fading)
    const backdropStyle = useAnimatedStyle(() => {
        const entranceOpacity = interpolate(entranceProgress.value, [0, 0.4], [0, 1], Extrapolate.CLAMP);
        const dismissOpacity = interpolate(dismissY.value, [0, SCREEN_HEIGHT * 0.4], [1, 0], Extrapolate.CLAMP);

        return {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: '#F3F4F6',
            opacity: entranceOpacity * dismissOpacity,
            zIndex: 0,
        };
    }, [entranceProgress, dismissY]);

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

        if (flatListRef.current && initialIndex >= 0) {
            const scrollToCorrectPosition = () => {
                try {
                    flatListRef.current?.scrollToIndex({
                        index: initialIndex,
                        animated: false
                    });
                } catch (error) {
                    flatListRef.current?.scrollToOffset({
                        offset: initialIndex * SCREEN_DIMENSIONS.width,
                        animated: false
                    });
                }
            };

            scrollToCorrectPosition();
            // Immediate entrance on UI thread
            entranceProgress.value = withTiming(1, { duration: 500 }); // Slightly faster duration (500ms)
        }
    }, [initialArticleId, initialIndex, isVisible, items.length]);

    // Fetch categories
    useEffect(() => {
        (async () => {
            try {
                const apiRes = await getIngestionCategories();
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
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <GestureDetector gesture={verticalPanGesture}>
                <View style={{ flex: 1 }}>
                    {/* PLANE 0: BACKGROUND (Orchestrated) */}
                    <Animated.View style={backdropStyle} />

                    {/* PLANE 1: ARTICLE CONTENT PAGER */}
                    {/* STAFF FIX: Use a REAL FlatList wrapper instead of an invisible overlay */}
                    {/* This ensures native handling of Horizontal (Page) vs Vertical (Scroll) gestures */}
                    <Animated.View style={[
                        { flex: 1, zIndex: 1 },
                        containerStyle, // Apply dismiss transform to the whole pager
                        useAnimatedStyle(() => ({
                            opacity: entranceProgress.value,
                            transform: [
                                ...(containerStyle ? (Array.isArray(containerStyle) ? containerStyle[0].transform || [] : []) : []),
                                { translateY: interpolate(entranceProgress.value, [0, 1], [30, 0], Extrapolate.CLAMP) }
                            ]
                        }))
                    ]}>
                        <Animated.FlatList
                            ref={flatListRef}
                            data={items}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            scrollEventThrottle={16}
                            decelerationRate="fast"
                            snapToInterval={SCREEN_DIMENSIONS.width}
                            snapToAlignment='center'
                            bounces={false}
                            windowSize={3}
                            initialNumToRender={1}
                            maxToRenderPerBatch={2}
                            removeClippedSubviews={Platform.OS === 'android'}
                            initialScrollIndex={initialIndex}
                            getItemLayout={getItemLayout}

                            // Prevent horizontal scrolling when in comments mode
                            scrollEnabled={mode === 'reading'}

                            // Update Active Article on Swipe
                            onMomentumScrollEnd={handleScroll}

                            renderItem={({ item }) => (
                                <ArticlePageItem
                                    item={item}
                                    activeArticle={activeArticle}
                                    mode={mode}
                                    articleScrollY={articleScrollY}
                                    categories={categories}
                                    commentProgress={commentProgress}
                                    heroHeightSV={heroHeightSV}
                                    top={top}
                                />
                            )}
                        />

                        {/* Pagination Indicators - anchored to reading mode container */}
                        <Animated.View style={[
                            {
                                position: 'absolute',
                                top: 10,
                                left: 0,
                                right: 0,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                paddingHorizontal: 20,
                                gap: 4,
                                zIndex: 10,
                                flex: 1,
                            },
                            useAnimatedStyle(() => ({
                                opacity: interpolate(commentProgress.value, [0, 0.1], [1, 0], Extrapolate.CLAMP),
                                pointerEvents: commentProgress.value < 0.1 ? 'auto' : 'none'
                            }))
                        ]}>
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
                        </Animated.View>

                        {/* Up Arrow Button - Fixed Position */}
                        <Animated.View
                            style={[
                                {
                                    position: 'absolute',
                                    bottom: 24 + bottom,
                                    alignSelf: 'center',
                                    zIndex: 60,
                                },
                                useAnimatedStyle(() => ({
                                    opacity: interpolate(commentProgress.value, [0, 0.2], [1, 0], Extrapolate.CLAMP),
                                    transform: [{ translateY: interpolate(commentProgress.value, [0, 0.2], [0, 10], Extrapolate.CLAMP) }],
                                    pointerEvents: commentProgress.value < 0.1 ? 'auto' : 'none'
                                }))
                            ]}
                        >
                            <TouchableOpacity
                                onPress={openComments}
                                activeOpacity={0.8}
                            >
                                <Svg width="48" height="28" viewBox="0 0 48 28" fill="none">
                                    <Rect width="48" height="28" rx="14" fill="#F7F7F7" />
                                    <G clipPath="url(#clip0_125_3055)">
                                        <Path
                                            d="M20 16L24 12L28 16"
                                            stroke="#9DA2A9"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                        />
                                    </G>
                                    <Defs>
                                        <ClipPath id="clip0_125_3055">
                                            <Rect width="24" height="24" fill="white" transform="translate(12 2)" />
                                        </ClipPath>
                                    </Defs>
                                </Svg>
                            </TouchableOpacity>
                        </Animated.View>
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
                            commentProgress={commentProgress}
                        />
                    </Animated.View>

                    {/* PLANE 3: HERO CARD (Persistent Top layer) */}
                    <Animated.View style={[heroLayerStyle]}>
                        <HeroCard
                            item={currentItem}
                            commentProgress={commentProgress}
                            entranceProgress={entranceProgress}
                        />
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
};

export default ExpandNewsItem;