import { useNewsItemAnimations } from '@/hooks/useAnimations';
import { useCombinedSwipe } from '@/hooks/useCombined';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    Platform,
    TouchableOpacity
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import CommentSectionModal from '@/components/comment/commentSectionModal';
import { getAllCategories } from '@/api/apiCategories';
import { CategoryType } from '@/types/CategoryTypes';
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
    const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
    const {
        animatedValues,
        panGesture,
        imageAnimatedStyle,
        gradientAnimatedStyle,
        titleAnimatedStyle,
        contentAnimatedStyle,
        dragIndicatorAnimatedStyle,
        modalAnimatedStyle
    } = useNewsItemAnimations(isCommentModalVisible, onClose);
    const [activeArticle, setActiveArticle] = useState(initialArticleId);

    // Calculate initial index based on the ID
    const initialIndex = useMemo(() => {
        const index = items.findIndex((item: any) => item.id == initialArticleId);
        return index >= 0 ? index : 0;
    }, [items, initialArticleId]);

    const currentIndexRef = useRef(initialIndex);

    // Reset currentIndexRef when initialArticleId changes (component reopened with different article)
    useEffect(() => {
        if (!isVisible) {
            // Reset state when component becomes invisible
            setIsCommentModalVisible(false);
            return;
        }

        // Component is visible - reset all state
        currentIndexRef.current = initialIndex;
        setActiveArticle(initialArticleId);
        setIsCommentModalVisible(false); // Reset comment modal state

        // Ensure FlatList scrolls to correct position when reopened
        if (flatListRef.current) {
            // Use multiple attempts to ensure scroll works
            const scrollToCorrectPosition = () => {
                try {
                    flatListRef.current?.scrollToIndex({
                        index: initialIndex,
                        animated: false
                    });
                } catch (error) {
                    // Fallback to scrollToOffset if scrollToIndex fails
                    try {
                        flatListRef.current?.scrollToOffset({
                            offset: initialIndex * SCREEN_DIMENSIONS.width,
                            animated: false
                        });
                    } catch (offsetError) {
                        // If both fail, try again after a delay
                        setTimeout(() => {
                            flatListRef.current?.scrollToOffset({
                                offset: initialIndex * SCREEN_DIMENSIONS.width,
                                animated: false
                            });
                        }, 200);
                    }
                }
            };

            // Try immediately
            requestAnimationFrame(() => {
                scrollToCorrectPosition();
                // Also try after a short delay to ensure FlatList is ready
                setTimeout(scrollToCorrectPosition, 100);
            });
        }
    }, [initialArticleId, initialIndex, isVisible]);

    const handleCommentModalClose = () => {
        setIsCommentModalVisible(false);
    };

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
    }, []);

    const { scrollEnabled, animatedStyle } = useCombinedSwipe({
        data: items,
        currentIndex: currentIndexRef.current,
        onSwipeLeft: (index) => {
            // Navigate to next item (swipe left = next)
            const nextIndex = currentIndexRef.current + 1;
            if (flatListRef.current && !isCommentModalVisible && nextIndex < items.length) {
                currentIndexRef.current = nextIndex;
                if (items[nextIndex]) {
                    setActiveArticle(items[nextIndex].id);
                }
                flatListRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true
                });
            }
        },
        onSwipeRight: (index) => {
            // Navigate to previous item (swipe right = previous)
            const prevIndex = currentIndexRef.current - 1;
            if (flatListRef.current && !isCommentModalVisible && prevIndex >= 0) {
                currentIndexRef.current = prevIndex;
                if (items[prevIndex]) {
                    setActiveArticle(items[prevIndex].id);
                }
                flatListRef.current.scrollToIndex({
                    index: prevIndex,
                    animated: true
                });
            }
        },
        onSwipeUp: () => {
            if (!isCommentModalVisible) {
                setIsCommentModalVisible(true);
            }
        },
        onSwipeDown: () => {
            if (!isCommentModalVisible && onClose) {
                onClose();
            }
        },
        isCommentModalVisible
    });

    const handleScroll = useCallback((event: any) => {
        if (!isVisible) return; // Don't update if component is not visible

        const offsetX = event.nativeEvent.contentOffset.x;
        const slideIndex = Math.round(offsetX / SCREEN_DIMENSIONS.width);

        // Clamp index to valid range
        const validIndex = Math.max(0, Math.min(slideIndex, items.length - 1));

        if (validIndex !== currentIndexRef.current) {
            currentIndexRef.current = validIndex;
            if (items[validIndex]) {
                setActiveArticle(items[validIndex].id);
            }
        }
    }, [items, isVisible]);

    const handleUpButtonPress = () => {
        setIsCommentModalVisible(true);
    };

    const renderScreen = useCallback(({ item }: { item: any }) => {
        const category = categories.find((cat: CategoryType) => cat.id === item.category_id);
        const imageWrapperStyle = {
            ...IMAGE_WRAPPER_STYLE,
            borderBottomRightRadius: isCommentModalVisible ? 20 : 0,
            borderBottomLeftRadius: isCommentModalVisible ? 20 : 0,
        };

        // Emil's pattern: Use Reanimated animated styles
        const containerAnimatedStyle = useAnimatedStyle(() => {
            'worklet';
            return {
                transform: [{ scale: animatedValues.scale.value }],
            };
        }, []);

        return (
            <Animated.View
                style={[{
                    width: SCREEN_DIMENSIONS.width,
                    backgroundColor: isCommentModalVisible ? '#F3F4F6' : 'white',
                }, containerAnimatedStyle]}
                collapsable={false} // Prevent view collapsing for smoother animations
                pointerEvents={isCommentModalVisible ? 'none' : 'auto'} // Allow touches to pass through when comment modal is open
            >
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            imageWrapperStyle,
                            imageAnimatedStyle
                        ]}
                    >
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
                        <Animated.View style={[GRADIENT_STYLE, gradientAnimatedStyle]}>
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.8)']}
                                style={{ flex: 1 }}
                            />
                        </Animated.View>

                        <Animated.View style={[
                            {
                                position: 'absolute',
                                bottom: 32,
                                left: 20,
                                right: 20,
                            },
                            titleAnimatedStyle
                        ]}>
                            {isCommentModalVisible && (
                                <Text className="text-[22px] font-domine text-white">
                                    {item.title}
                                </Text>
                            )}
                        </Animated.View>

                        <Animated.View style={[
                            {
                                position: 'absolute',
                                bottom: 12,
                                alignSelf: 'center',
                            },
                            dragIndicatorAnimatedStyle
                        ]}>
                            {isCommentModalVisible && (
                                <View className='h-[4px] w-[24px] rounded-full bg-[#FFFFFF]/20' />
                            )}
                        </Animated.View>
                    </Animated.View>
                </GestureDetector>

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

                {/* Pagination Indicators - Story Style */}
                {!isCommentModalVisible && (
                    <View style={{
                        position: 'absolute',
                        top: 60,
                        left: 10,
                        right: 10,
                        flexDirection: 'row',
                        height: 3,
                        justifyContent: 'center',
                        gap: 4
                    }}>
                        {items.map((_, idx) => (
                            <View
                                key={idx}
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    backgroundColor: idx === currentIndexRef.current ? 'white' : 'rgba(255,255,255,0.3)',
                                    borderRadius: 2
                                }}
                            />
                        ))}
                    </View>
                )}

                {!isCommentModalVisible && (
                    <TouchableOpacity
                        className="absolute bottom-[40px] self-center bg-[#F7F7F7] rounded-full px-[20px] py-[8px]"
                        onPress={handleUpButtonPress}
                        activeOpacity={0.7}
                    >
                        <AntDesign name="up" size={12} color="#9DA2A9" />
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    }, [isCommentModalVisible, categories, animatedValues]);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: SCREEN_DIMENSIONS.width,
        offset: SCREEN_DIMENSIONS.width * index,
        index,
    }), []);

    return (
        <Animated.View style={[{ flex: 1, marginTop: 50 }]}>
            <Animated.View style={[
                { flex: 1, backgroundColor: 'white' },
                animatedStyle
            ]}>
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
                    scrollEventThrottle={16} // Optimized to 16ms (60fps) to reduce bridge traffic
                    scrollEnabled={!isCommentModalVisible && isVisible} // Disable only when comment modal is open or component not visible
                    maintainVisibleContentPosition={null} // Allow free scrolling
                    disableScrollViewPanResponder={false} // Ensure FlatList can handle its own gestures
                    decelerationRate="fast" // Standard "paging" feel
                    snapToInterval={SCREEN_DIMENSIONS.width}
                    snapToAlignment='center'
                    removeClippedSubviews={Platform.OS === 'android'} // Improve memory on Android
                    bounces={false} // Disable bounce for smoother feel
                    overScrollMode="never" // Android: prevent over-scroll glow
                    directionalLockEnabled={true} // iOS: lock to one direction
                    disableIntervalMomentum={true} // Smoother snap behavior
                    windowSize={3} // Optimize memory: only render current + 1 offscreen
                    maxToRenderPerBatch={1} // Only render 1 item at a time
                    initialNumToRender={1} // Only render initial item
                    updateCellsBatchingPeriod={50}
                    onScrollToIndexFailed={(info) => {
                        // Fallback: scroll to offset if scrollToIndex fails
                        const wait = new Promise(resolve => setTimeout(resolve, 100));
                        wait.then(() => {
                            const offset = info.averageItemLength * info.index;
                            flatListRef.current?.scrollToOffset({ offset, animated: false });
                            // Update ref after scroll
                            currentIndexRef.current = info.index;
                            if (items[info.index]) {
                                setActiveArticle(items[info.index].id);
                            }
                        });
                    }}
                    onScroll={(event) => {
                        // Real-time scroll tracking for better responsiveness
                        if (isVisible && !isCommentModalVisible) {
                            handleScroll(event);
                        }
                    }}
                    nestedScrollEnabled={true} // Allow nested scrolling
                />
            </Animated.View>
            <CommentSectionModal
                postId={activeArticle.toString()}
                isVisible={isCommentModalVisible}
                onClose={handleCommentModalClose}
            />
        </Animated.View>
    );
};

export default ExpandNewsItem;