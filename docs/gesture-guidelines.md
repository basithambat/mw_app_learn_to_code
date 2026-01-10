# Gesture Architecture Guidelines

This document outlines the strict rules for implementing gestures and animations in the WhatSay app to maintain a clean, bug-free architecture.

## Core Principles

### 1. Single Gesture Owner Per Surface

**Rule:** Each UI surface (screen/component) must have exactly ONE vertical gesture owner.

**✅ Correct:**
```typescript
// Detail screen: useExpandedArticleGestures owns ALL vertical gestures
const { verticalPanGesture, ... } = useExpandedArticleGestures({ ... });

<GestureDetector gesture={verticalPanGesture}>
  {/* Entire screen wrapped once */}
</GestureDetector>
```

**❌ Wrong:**
```typescript
// Multiple vertical gesture owners = conflicts
<GestureDetector gesture={panGesture1}>
  <GestureDetector gesture={panGesture2}>  // ❌ CONFLICT
```

---

### 2. No JS Refs Inside Worklets

**Rule:** Never mutate JavaScript refs (`.current =`) inside Reanimated worklets.

**Why:** Worklets run on the UI thread. JS refs live on the JS thread. Mutating them causes undefined behavior.

**✅ Correct:**
```typescript
const gestureContext = useSharedValue({ startY: 0 });

.onBegin(() => {
  'worklet';
  gestureContext.value.startY = commentProgress.value; // ✅ SharedValue
})
```

**❌ Wrong:**
```typescript
const startY = useRef(0);

.onBegin(() => {
  'worklet';
  startY.current = 10; // ❌ JS ref in worklet
})
```

---

### 3. No SharedValue `.value` in Dependency Arrays

**Rule:** Don't put SharedValues in `useMemo`, `useCallback`, or `useEffect` dependency arrays.

**Why:** SharedValues are stable references. Their `.value` changes don't trigger React re-renders.

**✅ Correct:**
```typescript
const panGesture = useMemo(() => {
  return Gesture.Pan()
    .onUpdate(() => {
      commentProgress.value = ...; // ✅ Access .value in worklet
    });
}, [mode, openComments]); // ✅ Only JS dependencies
```

**❌ Wrong:**
```typescript
const panGesture = useMemo(() => {
  // ...
}, [commentProgress.value]); // ❌ .value in deps
```

---

### 4. Derived Values Only

**Rule:** Derive all animation values from a minimal set of core SharedValues. Don't create redundant SharedValues.

**✅ Correct:**
```typescript
// Core values
const commentProgress = useSharedValue(0); // 0 → 1
const dismissY = useSharedValue(0);

// Derived in animated styles
const containerStyle = useAnimatedStyle(() => {
  const scale = interpolate(commentProgress.value, [0, 1], [1, 0.94]);
  const translateY = interpolate(commentProgress.value, [0, 1], [0, -18]);
  return { transform: [{ scale }, { translateY }] };
});
```

**❌ Wrong:**
```typescript
// Too many independent SharedValues
const scale = useSharedValue(1);
const translateY = useSharedValue(0);
const opacity = useSharedValue(1);
const rotation = useSharedValue(0);
// ❌ Hard to keep synchronized
```

---

### 5. No Hooks in Render Callbacks

**Rule:** Never call React hooks inside `renderItem`, `renderScreen`, or any render callback.

**Why:** Violates React's Rules of Hooks. Extract to a component.

**✅ Correct:**
```typescript
// Extracted component with hooks at top-level
const ArticlePage = ({ item }) => {
  const animatedStyle = useAnimatedStyle(() => { ... }); // ✅
  return <Animated.View style={animatedStyle}>{...}</Animated.View>;
};

<FlatList
  renderItem={({ item }) => <ArticlePage item={item} />}
/>
```

**❌ Wrong:**
```typescript
<FlatList
  renderItem={({ item }) => {
    const animatedStyle = useAnimatedStyle(() => { ... }); // ❌ Hook in callback
    return <Animated.View>{...}</Animated.View>;
  }}
/>
```

---

### 6. Use Modern Gesture API Only

**Rule:** Use `Gesture.Pan()` from `react-native-gesture-handler`. Avoid deprecated `PanGestureHandler` component.

**✅ Correct:**
```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan()
  .onUpdate(() => { ... })
  .onEnd(() => { ... });

<GestureDetector gesture={panGesture}>
  {children}
</GestureDetector>
```

**❌ Wrong (Deprecated):**
```typescript
import { PanGestureHandler } from 'react-native-gesture-handler';

<PanGestureHandler onGestureEvent={handler}>  // ❌ Deprecated
  {children}
</PanGestureHandler>
```

---

## Enforcement

These rules are enforced by:

1. **ESLint:** Catches hook violations at lint time
2. **TypeScript:** Type safety for SharedValues
3. **CI Script:** `scripts/gesture-audit.ts` fails CI on anti-patterns
4. **Code Review:** Manual verification

---

## Testing Gestures

When testing gesture changes:

1. Test on both iOS and Android
2. Test direction lock (8px threshold)
3. Test all state transitions
4. Verify no performance degradation
5. Check for memory leaks in React DevTools

---

## Common Mistakes to Avoid

| ❌ Mistake | ✅ Solution |
|-----------|------------|
| Multiple gesture owners | Single `useExpandedArticleGestures` |
| JS refs in worklets | Use `useSharedValue` |
| `.value` in deps | Only put SharedValue reference in deps |
| 7 independent SharedValues | 2 core + derived values |
| Hooks in renderItem | Extract component |
| `PanGestureHandler` | Use `Gesture.Pan()` |

---

## References

- [Reanimated Best Practices](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#animations-in-reanimated)
- [React Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [Gesture Handler Documentation](https://docs.swmansion.com/react-native-gesture-handler/)

---

**Last Updated:** 2026-01-10
