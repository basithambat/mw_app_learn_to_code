// src/hooks/useKeyboardController.ts
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, KeyboardEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

type KeyboardController = {
    keyboardVisibleSV: any; // SharedValue<number>
    keyboardHeightSV: any;  // SharedValue<number>
    keyboardProgress: any;  // SharedValue<number> (optional for fades)
    keyboardHeightJS: number;
    isKeyboardVisibleJS: boolean;
};

export function useKeyboardController(): KeyboardController {
    const keyboardVisibleSV = useSharedValue(0); // 0/1
    const keyboardHeightSV = useSharedValue(0);
    const keyboardProgress = useSharedValue(0); // 0..1 for optional dim/blur

    const [keyboardHeightJS, setKeyboardHeightJS] = useState(0);
    const [isKeyboardVisibleJS, setIsKeyboardVisibleJS] = useState(false);

    const lastHeightRef = useRef(0);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const setKeyboardState = (visible: boolean, height: number) => {
        // Debounce to avoid Android intermediate events
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setIsKeyboardVisibleJS(visible);
            setKeyboardHeightJS(height);

            keyboardVisibleSV.value = visible ? 1 : 0;
            keyboardHeightSV.value = height;

            // progress is optional; useful for fades
            keyboardProgress.value = withTiming(visible ? 1 : 0, { duration: 220 });
        }, 50);
    };

    const onShow = (e: KeyboardEvent) => {
        const h = e.endCoordinates?.height ?? 0;

        // Ignore tiny fluctuations
        if (Math.abs(h - lastHeightRef.current) <= 10 && isKeyboardVisibleJS) return;

        lastHeightRef.current = h;
        setKeyboardState(true, h);
    };

    const onHide = () => {
        lastHeightRef.current = 0;
        setKeyboardState(false, 0);
    };

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, onShow);
        const hideSub = Keyboard.addListener(hideEvent, onHide);

        return () => {
            showSub.remove();
            hideSub.remove();
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return {
        keyboardVisibleSV,
        keyboardHeightSV,
        keyboardProgress,
        keyboardHeightJS,
        isKeyboardVisibleJS,
    };
}
