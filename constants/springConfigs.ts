/**
 * Centralized Spring Animation Configurations
 * 
 * These configs follow Emil Kowalski's recommendations for natural, responsive animations.
 * Use these constants throughout the app for consistent animation feel.
 * 
 * @see https://github.com/software-mansion/react-native-reanimated
 */

/**
 * Snappy config - for quick, responsive UI feedback
 * Use for: button presses, quick transitions, resets
 */
export const SPRING_CONFIG_SNAPPY = {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
} as const;

/**
 * Smooth config - for gentle, elegant transitions
 * Use for: modal exits, page transitions, dismissals
 */
export const SPRING_CONFIG_SMOOTH = {
    damping: 25,
    stiffness: 200,
    mass: 1,
} as const;

/**
 * Bouncy config - for playful, high-energy interactions
 * Use for: swipe cards, velocity-aware gestures, highlight effects
 */
export const SPRING_CONFIG_BOUNCY = {
    damping: 15,
    stiffness: 350,
    mass: 0.5,
} as const;

/**
 * Timing config - for non-spring animations
 * Use for: opacity fades, size changes, non-physical animations
 */
export const TIMING_CONFIG = {
    duration: 250,
} as const;

/**
 * Platform-specific timing
 */
import { Platform } from 'react-native';

export const TIMING_CONFIG_PLATFORM = {
    duration: Platform.select({ ios: 250, android: 300 }),
} as const;
