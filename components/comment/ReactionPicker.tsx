import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    runOnJS,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const REACTIONS = ['🔥', '❤️', '😂', '😮', '👍'];

interface ReactionPickerProps {
    onSelect: (reaction: string) => void;
    onClose: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose }) => {
    const scale = useSharedValue(0.85);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 250 });
        opacity.value = withSpring(1);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: interpolate(opacity.value, [0, 1], [10, 0], Extrapolate.CLAMP) }
        ],
        opacity: opacity.value,
    }));

    const handleSelect = (reaction: string) => {
        onSelect(reaction);
        // Exit animation
        scale.value = withSpring(0.9);
        opacity.value = withSpring(0, {}, () => {
            runOnJS(onClose)();
        });
    };

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <BlurView intensity={80} tint="light" style={styles.blurContainer}>
                {REACTIONS.map((emoji, index) => (
                    <ReactionItem
                        key={emoji}
                        emoji={emoji}
                        onPress={() => handleSelect(emoji)}
                        index={index}
                    />
                ))}
            </BlurView>
        </Animated.View>
    );
};

const ReactionItem = ({ emoji, onPress, index }: { emoji: string; onPress: () => void; index: number }) => {
    const itemScale = useSharedValue(1);

    const animatedItemStyle = useAnimatedStyle(() => ({
        transform: [{ scale: itemScale.value }],
    }));

    const handlePress = () => {
        itemScale.value = withSequence(
            withSpring(1.3, { damping: 5 }),
            withSpring(1)
        );
        onPress();
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
            <Animated.View style={[styles.emojiContainer, animatedItemStyle]}>
                <Text style={styles.emojiText}>{emoji}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 44,
        left: -12, // Offset to compensate for small parent
        width: 250, // Enough room for 5 emojis
        zIndex: 1000,
        // Airbnb Shadow System
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
    },
    blurContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        paddingHorizontal: 12,
        paddingVertical: 10,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    emojiContainer: {
        paddingHorizontal: 8,
    },
    emojiText: {
        fontSize: 28,
    },
});
