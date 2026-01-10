// Layout design tokens for 2-plane architecture
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LAYOUT = {
    // Hero heights (percentages of screen)
    HERO_READING_PCT: 0.40,     // 40% in READING state
    HERO_COMMENTS_PCT: 0.30,    // 30% in COMMENTS_DOCKED state

    // Hero widths
    HERO_WIDTH_READING: 1.0,    // 100%
    HERO_WIDTH_COMMENTS: 0.94,  // 94%

    // Border radius
    HERO_RADIUS_READING: 0,
    HERO_RADIUS_COMMENTS: 24, // Staff Fix: 24px for deep rounded look

    // Hero heights (fixed % of screen)
    HERO_READING_HEIGHT: SCREEN_HEIGHT * 0.40,
    HERO_COMMENTS_HEIGHT: SCREEN_HEIGHT * 0.34, // Staff Fix: 34% (was 30%) for better visibility

    // Screen dimensions
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
};

export const ANIMATION = {
    DURATION_NORMAL: 220,
    DURATION_FAST: 150,
};
