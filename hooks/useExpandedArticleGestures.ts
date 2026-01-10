import { useState, useMemo, useCallback } from 'react';
import { Dimensions, Platform, Keyboard } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { SPRING_CONFIG_SNAPPY, SPRING_CONFIG_SMOOTH } from '@/constants/springConfigs';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// Derived: Sheet height (for comments modal)
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.95; // 95% of screen

// Gesture thresholds - EXACT values
const DIRECTION_LOCK_THRESHOLD = 8; // 8px movement to lock direction
const HORIZONTAL_FAIL_THRESHOLD = 50;

// Distance thresholds
const OPEN_DISTANCE = 260; // Distance to open comments
const CLOSE_DISTANCE = 220; // Distance to close comments
const DISMISS_THRESHOLD = 0.18 * SCREEN_HEIGHT; // P0 FIX: 18% (was 22%) - easier to complete dismiss

// Velocity thresholds
const VELOCITY_OPEN = -900; // Negative = upward
const VELOCITY_DISMISS = 1200; // Positive = downward
const VELOCITY_CLOSE = 1000; // Positive = downward

// Mode type
type GestureMode = 'reading' | 'comments' | 'dismissing';

// Direction lock type
type DirectionLock = 'none' | 'horizontal' | 'vertical';

interface UseExpandedArticleGesturesProps {
    onDismiss: () => void; // Navigation callback to close detail screen
    isWritingSV?: any; // SharedValue<number> (0/1)
}

/**
 * Unified gesture hook for expanded article detail screen.
 * Single source of truth for all vertical pan gestures and animations.
 * 
 * Architecture:
 * - commentProgress: 0 (closed) → 1 (fully open)
 * - dismissY: 0 (default) → SCREEN_HEIGHT (fully dismissed)
 * - All other values DERIVED from these two SharedValues
 * 
 * State machine:
 * - reading: Can swipe up to open comments, swipe down to dismiss
 * - comments: Can only swipe down to close comments (when scrollY ≤ 0)
 * - dismissing: All gestures disabled (transition state)
 */
export const useExpandedArticleGestures = ({
    onDismiss,
    isWritingSV,
}: UseExpandedArticleGesturesProps) => {
    // ============================================================================
    // JS State (mode)
    // ============================================================================
    const [mode, setMode] = useState<GestureMode>('reading');

    // ============================================================================
    // SharedValues (worklet-safe state)
    // ============================================================================

    // Core gesture state
    const commentProgress = useSharedValue(0); // 0 = closed, 1 = fully open
    const dismissY = useSharedValue(0); // 0 = default, SCREEN_HEIGHT = dismissed
    const directionLock = useSharedValue<DirectionLock>('none');
    const commentsScrollY = useSharedValue(0); // Synced from CommentSectionModal

    // UI-THREAD STATE MACHINE (0 = reading, 1 = comments)
    // This is the single source of truth for worklets.
    const activeModeSV = useSharedValue(0);

    // Context for gesture (replaces useRef pattern)
    const gestureContext = useSharedValue({ startY: 0 });

    // ============================================================================
    // Helper Actions (JS callbacks)
    // ============================================================================

    const openComments = useCallback(() => {
        setMode('comments');
        activeModeSV.value = 1;
        commentProgress.value = withSpring(1, SPRING_CONFIG_SMOOTH);
    }, [commentProgress, activeModeSV]);

    const closeComments = useCallback(() => {
        setMode('reading');
        activeModeSV.value = 0;
        commentProgress.value = withSpring(0, SPRING_CONFIG_SNAPPY);
    }, [commentProgress, activeModeSV]);

    const dismissDetail = useCallback(() => {
        setMode('dismissing');
        // activeModeSV.value stays at 0
        dismissY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG_SMOOTH, (finished) => {
            if (finished) {
                runOnJS(onDismiss)();
            }
        });
    }, [dismissY, onDismiss]);

    // ============================================================================
    // Vertical Pan Gesture (single source of truth)
    // ============================================================================

    const verticalPanGesture = useMemo(() => {
        return Gesture.Pan()
            .activeOffsetY([-DIRECTION_LOCK_THRESHOLD, DIRECTION_LOCK_THRESHOLD])
            .failOffsetX([-HORIZONTAL_FAIL_THRESHOLD, HORIZONTAL_FAIL_THRESHOLD])
            .enabled(mode !== 'dismissing') // Disable during dismissing transition
            .onBegin(() => {
                'worklet';
                gestureContext.value.startY = commentProgress.value;
                directionLock.value = 'none';
            })
            .onUpdate((event) => {
                'worklet';
                const { translationX, translationY } = event;

                // Direction lock logic: First significant movement (>8px) wins
                if (directionLock.value === 'none') {
                    const absDx = Math.abs(translationX);
                    const absDy = Math.abs(translationY);

                    if (absDx > DIRECTION_LOCK_THRESHOLD || absDy > DIRECTION_LOCK_THRESHOLD) {
                        if (absDx > absDy) {
                            directionLock.value = 'horizontal'; // FlatList will handle
                        } else {
                            directionLock.value = 'vertical';
                        }
                    }
                }

                // If locked horizontal, do nothing (FlatList handles paging)
                if (directionLock.value === 'horizontal') {
                    return;
                }

                // Only process if locked to vertical
                if (directionLock.value !== 'vertical') {
                    return;
                }

                // MODE: reading (activeModeSV === 0)
                if (activeModeSV.value === 0) {
                    // Swipe UP (negative translationY) → update commentProgress
                    if (translationY < 0) {
                        const progress = Math.min(1, Math.abs(translationY) / OPEN_DISTANCE);
                        commentProgress.value = progress;
                    }
                    // Swipe DOWN (positive translationY) → update dismissY
                    else if (translationY > 0) {
                        dismissY.value = Math.min(SCREEN_HEIGHT, translationY);
                    }
                }

                // MODE: comments (activeModeSV === 1)
                else if (activeModeSV.value === 1) {
                    // PRIORITY: If Writing (keyboard visible), swipe down triggers dismiss first
                    if (isWritingSV && isWritingSV.value === 1 && translationY > 0) {
                        if (translationY > 20) {
                            runOnJS(Keyboard.dismiss)();
                        }
                        return; // BLOCK sheet movement
                    }

                    if (commentsScrollY.value <= 0 && translationY > 0) {
                        // User is dragging down from fully open state
                        // commentProgress goes from 1 → 0 as user drags down
                        const progress = Math.max(0, 1 - translationY / CLOSE_DISTANCE);
                        commentProgress.value = progress;

                        // Keep dismissY at 0 to ensure we stay on the article.
                        dismissY.value = 0;
                    }
                }
            })
            .onEnd((event) => {
                'worklet';
                const { velocityY } = event;

                // Reset direction lock
                directionLock.value = 'none';

                // MODE: comments (activeModeSV === 1)
                if (activeModeSV.value === 1) {
                    // P0 FIX: Always prioritize returning to Reading Mode
                    // Check if user dragged enough OR has enough velocity to just close comments
                    if (commentProgress.value < 0.65 || velocityY > VELOCITY_CLOSE) {
                        // Close comments → return to reading mode
                        activeModeSV.value = 0;

                        // STAFF FIX: Use a smoother spring and only flip JS mode after arrival to prevent pop-ins
                        commentProgress.value = withSpring(0, { damping: 24, stiffness: 180 }, (finished) => {
                            if (finished) runOnJS(setMode)('reading');
                        });
                        dismissY.value = withSpring(0, { damping: 24, stiffness: 180 });
                    } else {
                        // Snap back to fully open
                        commentProgress.value = withSpring(1, SPRING_CONFIG_SNAPPY);
                        dismissY.value = withSpring(0, SPRING_CONFIG_SNAPPY);
                    }
                    return;
                }

                // MODE: reading (activeModeSV === 0)
                if (activeModeSV.value === 0) {
                    // Check if user swiped up enough to open comments
                    if (commentProgress.value > 0.35 || velocityY < VELOCITY_OPEN) {
                        // Open comments
                        activeModeSV.value = 1;
                        commentProgress.value = withSpring(1, SPRING_CONFIG_SMOOTH);
                        runOnJS(setMode)('comments');
                    }
                    // Check if user swiped down enough to dismiss screen
                    else if (dismissY.value > DISMISS_THRESHOLD || velocityY > VELOCITY_DISMISS) {
                        // Dismiss detail screen
                        runOnJS(setMode)('dismissing');
                        dismissY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG_SMOOTH, (finished) => {
                            if (finished) {
                                runOnJS(onDismiss)();
                            }
                        });
                    }
                    // RESET - snap back to neutral
                    else {
                        commentProgress.value = withSpring(0, SPRING_CONFIG_SNAPPY);
                        dismissY.value = withSpring(0, SPRING_CONFIG_SNAPPY);
                    }
                }
            })
            .onFinalize(() => {
                'worklet';
                // Always reset direction lock when gesture ends
                directionLock.value = 'none';
            });
    }, [mode, openComments, closeComments, dismissDetail, commentProgress, dismissY, commentsScrollY, directionLock, gestureContext, activeModeSV, onDismiss]);

    // ============================================================================
    // Derived Animated Styles
    // ============================================================================

    // Container style (for ExpandNewsItem root)
    // Combines reading AND dismiss transformations
    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: dismissY.value },
            ],
        };
    }, [dismissY]);

    // Comments sheet style (bottom sheet modal)
    const commentsSheetStyle = useAnimatedStyle(() => {
        const sheetTranslateY = interpolate(
            commentProgress.value,
            [0, 1],
            [SHEET_HEIGHT, 0], // Start off-screen at sheet height, slide to 0
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { translateY: sheetTranslateY }
            ],
        };
    }, [commentProgress]);

    // ============================================================================
    // Return API
    // ============================================================================

    return {
        // Mode state
        mode,
        setMode,

        // SharedValues (for syncing external state)
        commentProgress,
        dismissY,
        directionLock,
        commentsScrollY,

        // Gesture
        verticalPanGesture,

        // Animated styles
        containerStyle,
        commentsSheetStyle,

        // Helper actions
        openComments,
        closeComments,
        dismissDetail,
    };
};
