# Animation Blueprint: Organic Card Stacks (v1.5 - Implementation Master)

This document contains the exact code-level logic required to recreate the WhatSay "Organic Stack" system from scratch, covering styling, physics, and orchestration.

## 1. Physics Engine Constants
```typescript
const springConfigSnap = {
  damping: 25,
  stiffness: 200,
  mass: 0.5,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

const springConfigSwipe = {
  damping: 20,
  stiffness: 150,
  mass: 1,
};
```

## 5. UI Spacing & Parallel Motion
- **Liquid Transition**: Background cards interpolate their X/Y position purely based on `index - activeIndex.value`.
- **Top Margin**: `marginTop: 40` on the stack wrapper.
- **Card-to-Pill Gap**: `marginBottom: 16` on the stack wrapper (Strictly enforced 16px gap to the unread pill).
- **Stack Container**: Fixed height of `CARD_HEIGHT` to ensure stable layout during parallel shifts.

## 2. Organic Personality Logic (Rotation)
```typescript
const getRotationValues = (id: number, categoryIdx?: number) => {
  if (categoryIdx !== undefined) {
    switch (categoryIdx % 6) {
      case 0: return { first: [-15, 0, 15], rest: [3, 0, 0] };
      case 1: return { first: [-15, 0, 15], rest: [-3, 0, 0] };
      case 2: return { first: [-15, 0, 15], rest: [0, 0, 0] };
      case 3: return { first: [-15, 0, 15], rest: [3, 0, 0] };
      case 4: return { first: [-15, 0, 15], rest: [-3, 0, 0] };
      case 5: return { first: [-15, 0, 15], rest: [0, 0, 0] };
    }
  }
  return { first: [-15, 0, 15], rest: [0, 0, 0] };
};
```

## 3. Gesture State Machine (Top Card)
```typescript
const panGesture = Gesture.Pan()
  .activeOffsetX([-5, 5])
  .onUpdate((event) => {
    if (isFirst) {
      translateX.value = event.translationX;
      activeIndex.value = interpolate(
        Math.abs(event.translationX),
        [0, SCREEN_WIDTH * 0.4],
        [0, 1],
        Extrapolate.CLAMP
      );
    }
  })
  .onFinalize((event) => {
    if (isFirst) {
      // Commit Threshold: A swipe is confirmed if:
      // - Velocity > 400px/s (Lowered from 500 for better "flick" response).
      // - Distance > 35% of SCREEN_WIDTH (Lowered from 40%).
      if (Math.abs(event.velocityX) > 400 || Math.abs(event.translationX) > SCREEN_WIDTH * 0.35) {
        activeIndex.value = withSpring(1, springConfigSwipe);
        // Momentum Injection: The exit withSpring uses the user's actual velocityX / 1000 to ensure the "throw" feel is maintained.
        translateX.value = withSpring(Math.sign(event.translationX) * SCREEN_WIDTH * 1.5, { ...springConfigSwipe, velocity: event.velocityX / 1000 }, (finished) => {
          if (finished) runOnJS(onSwipe)(event.translationX > 0 ? 'right' : 'left');
        });
      } else {
        activeIndex.value = withSpring(0, springConfigSnap);
        translateX.value = withSpring(0, springConfigSnap);
      }
    }
  });
```

## 4. Stack Depth Logic (Background Cards)
```typescript
const staticTranslateX = index * 15 * (categoryIndex % 3 === 0 ? 1 : categoryIndex % 3 === 1 ? -1 : 0);
const staticTranslateY = index * 1;
const staticOpacity = index <= 1 ? 1 : 1 - ((index - 1) / (maxIndex - 1)) * 0.5;

const animatedCardStyle = useAnimatedStyle(() => {
  const scale = interpolate(activeIndex.value, [index - 1, index, index + 1], [0.92, 1, 1.08], Extrapolate.CLAMP);
  const translateY = interpolate(activeIndex.value, [index - 1, index, index + 1], [-24, 0, 0], Extrapolate.CLAMP);
  const rotate = interpolate(isFirst ? translateX.value : activeIndex.value, 
    isFirst ? [-SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2] : [index-1, index, index+1],
    isFirst ? rotationValues.first : rotationValues.rest, Extrapolate.CLAMP);

  return {
    transform: [
      { scale },
      { translateY: translateY + (isFirst ? interpolate(Math.abs(translateX.value), [0, 200], [0, -4]) : staticTranslateY) },
      { rotate: `${rotate}deg` },
      { translateX: isFirst ? translateX.value : staticTranslateX },
    ],
    opacity: isFirst ? 1 : staticOpacity,
  };
});
```

## 5. Navigation & Continuity
### _layout.tsx
```typescript
<Stack.Screen name="(news)/[slug]" options={{
  presentation: 'transparentModal',
  animation: 'fade',
  contentStyle: { backgroundColor: 'transparent' }
}} />
```

### ExpandNewsItem.tsx (Orchestration)
```typescript
// Background fading on dismiss
const backdropStyle = useAnimatedStyle(() => ({
  opacity: interpolate(dismissY.value, [0, SCREEN_HEIGHT * 0.4], [1, 0], Extrapolate.CLAMP),
  backgroundColor: '#F3F4F6',
}));

// Entrance Animation
useEffect(() => {
  if (isVisible) {
    entranceProgress.value = 0;
    entranceProgress.value = withTiming(1, { duration: 600 });
  }
}, [isVisible]);
```

---
*Verified for Full Implementation Recovery by: Antigravity*
