import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Image, useWindowDimensions, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolate,
    SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SPRING_CONFIG_SNAPPY, SPRING_CONFIG_SMOOTH } from '@/constants/springConfigs';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Stack configuration
const MAX_VISIBLE_CARDS = 3;
const CARD_ASPECT_RATIO = 320 / 273; // Original aspect ratio
const STACK_OFFSET = 18; // Vertical pixels between stacked cards
const SWIPE_THRESHOLD = 100;

interface CardStackFeedProps {
    items: any[];
    onOpenArticle: (article: any, index: number) => void;
}

const StackCard = ({
    item,
    index,
    activeIndex,
    translationY,
    totalCards,
    onOpen
}: {
    item: any;
    index: number;
    activeIndex: SharedValue<number>;
    translationY: SharedValue<number>;
    totalCards: number;
    onOpen: () => void;
}) => {
    const { width: windowWidth } = useWindowDimensions();
    const CARD_WIDTH = windowWidth * 0.9;
    const CARD_HEIGHT = CARD_WIDTH * CARD_ASPECT_RATIO;

    // Calculate the logical index relative to the active card
    // 0 = active, 1 = next, etc.
    // We use a derived value in the style, but for react keys we use index.

    const animatedStyle = useAnimatedStyle(() => {
        // Current "stack position" of this card.
        // If activeIndex is 5, and this card is index 5, position is 0.
        // If activeIndex is 5, and this card is index 6, position is 1.
        const position = index - activeIndex.value;

        // If this card is the active one, it moves with translationY
        const isFirst = position === 0; // Floating point check might be needed if strictly interpolating, but usually OK for integer steps

        // However, we want smooth interpolation as activeIndex changes (e.g. 0 -> 1)
        // Let's rely on standard stack interpolation.

        // Scale: Active = 1, Next = 0.96, Next+1 = 0.92
        const scale = interpolate(
            position,
            [-1, 0, 1, 2],
            [1, 1, 0.96, 0.92],
            Extrapolate.CLAMP
        );

        // TranslateY:
        // Position 0: moves with gesture (translationY)
        // Position 1: sits at +OFFSET
        // Position 2: sits at +OFFSET*2

        // We add translationY only if it's the TOP card (position <= 0)
        // Actually, simpler:
        // If position is roughly 0, add translationY.

        const stackOffset = interpolate(
            position,
            [-1, 0, 1, 2],
            [0, 0, STACK_OFFSET, STACK_OFFSET * 2],
            Extrapolate.CLAMP
        );

        // Interactions:
        // When swiping UP (negative Y), top card moves up.
        // Card at pos 1 moves to pos 0 (scale 0.96 -> 1, offset -> 0).
        // Card at pos 0 moves up offscreen.

        // Correction: We drive this by `activeIndex` being a float?
        // Or discrete activeIndex + separate translationY?
        // User requested: "vertical swipe moves between cards".
        // Usually, drag -> translationY changes. On end -> snap activeIndex.

        // Let's assume standard deck logic:
        // The top card (index === activeIndex) transforms by translationY.value.
        // Background cards stay static until index changes?
        // Better: continuous interpolation if we want "following".
        // But for "Tinder/Stack" style, usually top card moves independently.

        const isTopCard = Math.round(activeIndex.value) === index;

        return {
            zIndex: totalCards - index,
            transform: [
                { scale },
                { translateY: isTopCard ? translationY.value + stackOffset : stackOffset }
            ],
            // Fade out cards deep in stack
            opacity: interpolate(
                position,
                [0, 2, 3],
                [1, 1, 0]
            )
        };
    });

    return (
        <Animated.View style={[styles.cardWrapper, { width: CARD_WIDTH, height: CARD_HEIGHT }, animatedStyle]}>
            <GestureDetector gesture={Gesture.Tap().onEnd(runOnJS(onOpen))}>
                <Animated.View style={styles.cardInner}>
                    <Image source={{ uri: item.image_url || item.image }} style={styles.image} resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.gradient}
                    />
                    <View style={styles.content}>
                        <Text style={styles.category}>{item.category || "News"}</Text>
                        <Text style={styles.title} numberOfLines={3}>{item.title}</Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
};

export const CardStackFeed: React.FC<CardStackFeedProps> = ({ items, onOpenArticle }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeIndex = useSharedValue(0); // Integer index
    const translationY = useSharedValue(0); // Offset of current card

    // "Window" of cards to render
    const visibleItems = items.slice(currentIndex, currentIndex + MAX_VISIBLE_CARDS + 1);

    const onSwipeComplete = (direction: 'up' | 'down') => {
        if (direction === 'up') {
            // Dismiss top card up, show next
            if (currentIndex >= items.length - 1) return; // End of list

            setCurrentIndex(prev => prev + 1);
            activeIndex.value = activeIndex.value + 1;
            translationY.value = 0; // Reset for next card (which is now top)
            // Wait, if we increment activeIndex, the NEXT component becomes the one driven by translationY.
        } else {
            // Previous card come back? 
            // Typically stack is "swipe away". 
            // If we want bidirectional, it's more complex.
            // Let's stick to "Swipe Up to Next" for now, maybe "Swipe Down" for prev?
            if (currentIndex <= 0) return;
            setCurrentIndex(prev => prev - 1);
            activeIndex.value = activeIndex.value - 1;
            translationY.value = 0;
        }
    };

    const panGesture = Gesture.Pan()
        .activeOffsetY([-10, 10])
        .onUpdate((e) => {
            // Only move the top card
            translationY.value = e.translationY;
        })
        .onEnd((e) => {
            // Velocity check
            if (e.translationY < -SWIPE_THRESHOLD || e.velocityY < -800) {
                // Swipe UP -> Next
                // Animate top card off screen UP
                translationY.value = withSpring(-SCREEN_HEIGHT, SPRING_CONFIG_SNAPPY, (finished) => {
                    if (finished) {
                        runOnJS(onSwipeComplete)('up');
                        // Reset translationY instanly? No, it needs to enter 0 for the NEW index.
                        // Actually, standard stack practice:
                        // 1. Animate card away.
                        // 2. Update React state (index++).
                        // 3. Reset SharedValue to 0 (because the NEW top card shouldn't be offset).
                        translationY.value = 0;
                    }
                });
            } else if (e.translationY > SWIPE_THRESHOLD || e.velocityY > 800) {
                // Swipe DOWN -> Previous?
                // Or just reset?
                // If we support scrolling BACK, we need to animate the PREVIOUS card IN.
                // For MVP Stack, let's just snap back if drag down doesn't meaningfuly trigger prev.
                // Or: Swipe Down triggers PREV.

                if (currentIndex > 0) {
                    // Logic for Previous is tricky without "Phantom" prev card.
                    // Let's just reset for now unless we implement full virtual list.
                    translationY.value = withSpring(0, SPRING_CONFIG_SNAPPY);
                } else {
                    translationY.value = withSpring(0, SPRING_CONFIG_SNAPPY);
                }
            } else {
                translationY.value = withSpring(0, SPRING_CONFIG_SNAPPY);
            }
        });

    // Re-render only the window
    // We map `visibleItems` but we need to pass their ACTUAL global index to match `activeIndex` logic?
    // Actually, simpler:
    // `activeIndex` stays at 0 relative to the window?
    // No, `activeIndex` tracks global index to coordinate shared transitions?
    // Let's keep it simple: `StackCard` receives `index` as relative 0, 1, 2...
    // And `activeIndex` is always 0 (the top of the rendered stack).

    // Wait, if we use `activeIndex` shared value to animate, it's smoother.
    // But tearing down components on index change resets state.

    // Better approach for "Infinite" stack:
    // Always render 3 cards: Top, Middle, Bottom.
    // Data shifts through them.
    // `activeIndex` is always 0.
    // When we "swipe up", we animate top card out, then shift data array, active card becomes 0 again.

    const animatedItems = visibleItems.map((item, relIndex) => ({
        ...item,
        relIndex // 0, 1, 2
    }));

    return (
        <View style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={styles.stackArea}>
                    {animatedItems.map((item, i) => (
                        <StackCard
                            key={item.id} // Stable key is important
                            item={item}
                            index={i} // 0, 1, 2
                            activeIndex={useSharedValue(0)} // Always 0 (we shift data)
                            translationY={translationY}
                            totalCards={MAX_VISIBLE_CARDS}
                            onOpen={() => onOpenArticle(item, currentIndex + i)}
                        />
                    )).reverse()}
                </Animated.View>
            </GestureDetector>
        </View>
    );
};
// Note: reverse() is because last rendered is on top in Z-order default, 
// unless we strictly control Z-index (which we do). 
// Actually standard RN: last child = top. 
// So map gives [0, 1, 2]. We want 0 on top? No, we want 0 (Top) to be visible.
// If 0 is top card, it must be rendered LAST or have highest Z.
// StackCard has `zIndex: totalCards - index`.
// So 0 has zIndex 3. 1 has 2.
// So drawing order doesn't matter as much, but interactions might.
// The gesture detector wraps the whole area.
// We should check interaction.

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40 // Status bar clearance
    },
    stackArea: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    cardWrapper: {
        position: 'absolute',
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardInner: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#eee'
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 180,
    },
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    category: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        opacity: 0.9
    },
    title: {
        color: 'white',
        fontSize: 22,
        fontFamily: 'Domine', // Usage of app font
        lineHeight: 28,
        fontWeight: '600'
    }
});
