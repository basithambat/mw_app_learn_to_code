/**
 * Reanimated DEV-only Runtime Warnings
 * 
 * These utilities help catch common Reanimated anti-patterns during development.
 * They are stripped in production builds.
 */

import { useEffect, useRef } from 'react';
import { SharedValue } from 'react-native-reanimated';

/**
 * Warns if a gesture object changes identity between renders.
 * Gestures should be stable (wrapped in useMemo).
 * 
 * @example
 * const panGesture = useMemo(() => Gesture.Pan()..., []);
 * useStableGestureWarning(panGesture, 'ArticleSwipe');
 */
export const useStableGestureWarning = (
    gesture: any,
    name: string
) => {
    if (__DEV__) {
        const gestureRef = useRef(gesture);

        useEffect(() => {
            if (gestureRef.current !== gesture) {
                console.warn(
                    `⚠️ [REANIMATED] Gesture "${name}" changed identity!`,
                    `This may cause performance issues. Wrap in useMemo.`,
                    `\nSee: https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gestures-composition`
                );
                gestureRef.current = gesture;
            }
        }, [gesture, name]);
    }
};

/**
 * Warns if a SharedValue is incorrectly placed in a dependency array.
 * SharedValues are stable references and should NOT be in deps.
 * 
 * @example
 * const deps = [onClose, screenWidth];
 * warnSharedValueInDeps(deps, 'panGesture useMemo');
 */
export const warnSharedValueInDeps = (deps: any[], hookName: string) => {
    if (__DEV__) {
        deps.forEach((dep, i) => {
            if (dep && typeof dep === 'object' && '_value' in dep) {
                console.error(
                    `❌ [REANIMATED] SharedValue detected in ${hookName} dependency array at index ${i}!`,
                    `\nThis will cause crashes. Remove it.`,
                    `\nSharedValues are stable references (like refs) and should NOT be in dependency arrays.`,
                    `\nSee: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#shared-value`
                );
            }
        });
    }
};

/**
 * Warns if attempting to use a variable before declaration in a worklet.
 * Common in gesture handlers.
 * 
 * @example
 * const opacity = useSharedValue(1);
 * const gesture = useMemo(() => {
 *   warnIfUndefined(opacity, 'opacity', 'panGesture');
 *   return Gesture.Pan().onUpdate(() => { opacity.value = 1; });
 * }, []);
 */
export const warnIfUndefined = (value: any, name: string, context: string) => {
    if (__DEV__) {
        if (value === undefined) {
            console.error(
                `❌ [REANIMATED] Variable "${name}" is undefined in ${context}!`,
                `\nThis usually means it's used before declaration.`,
                `\nMove the declaration ABOVE ${context}.`
            );
        }
    }
};

/**
 * Warns if a spring/timing config is not a stable reference.
 * Configs should be constants, not objects created in render.
 * 
 * @example
 * const config = { damping: 20 }; // ❌ Recreated every render
 * warnUnstableConfig(config, 'springConfig');
 * 
 * // ✅ Better: import { SPRING_CONFIG_SNAPPY } from '@/constants/springConfigs';
 */
export const warnUnstableConfig = (config: any, name: string) => {
    if (__DEV__) {
        const configRef = useRef(config);

        useEffect(() => {
            if (configRef.current !== config) {
                console.warn(
                    `⚠️ [REANIMATED] Animation config "${name}" changed identity!`,
                    `\nThis may cause unnecessary re-renders.`,
                    `\nMove to a constant outside the component or use a centralized config.`,
                    `\nSee: /constants/springConfigs.ts`
                );
                configRef.current = config;
            }
        }, [config, name]);
    }
};

/**
 * Logs all hook dependencies for debugging.
 * Useful for tracking down stale closure bugs.
 * 
 * @example
 * const panGesture = useMemo(() => {
 *   logDependencies('panGesture', [isFirst, translateX, onSwipe]);
 *   return Gesture.Pan()...
 * }, [isFirst, translateX, onSwipe]);
 */
export const logDependencies = (hookName: string, deps: any[]) => {
    if (__DEV__) {
        console.log(`[REANIMATED] ${hookName} dependencies:`, deps.map((dep, i) => {
            if (typeof dep === 'function') return `[${i}] function`;
            if (dep && typeof dep === 'object' && '_value' in dep) return `[${i}] SharedValue ⚠️`;
            return `[${i}] ${typeof dep}: ${JSON.stringify(dep)}`;
        }));
    }
};
