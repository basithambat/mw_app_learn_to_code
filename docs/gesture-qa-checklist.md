# Manual QA Checklist - Gesture State Machine

This document provides a comprehensive manual testing checklist for the gesture state machine on the detail screen.

## Prerequisites

**Platforms to Test:**
- ✅ iOS (Simulator or Physical Device)
- ✅ Android (Emulator or Physical Device)

**Build the app:**
```bash
# iOS
npm run ios

# Android
npm run android
```

**Access Gesture Playground (DEV ONLY):**
Navigate to: `app/(dev)/gesture-playground` in your development build.

---

## Test Cases

### 1. Basic Gesture Flow

#### Test 1.1: Reading → Comments
**Steps:**
1. Open detail screen (swipe up on article card from home)
2. Swipe UP from anywhere on the article
3. **Expected:** Comments open smoothly
4. **Verify:** 
   - Article scales down to 94%
   - Article translates up by 18px
   - Dim overlay appears (55% opacity)
   - Comments sheet slides up from bottom
   - FlatList horizontal paging is LOCKED (can't swipe left/right)

**Pass Criteria:**
- [ ] Animation is smooth (60fps)
- [ ] No jank or frame drops
- [ ] Comments open correctly
- [ ] Can't page to next article

---

#### Test 1.2: Comments → Reading (Close)
**Steps:**
1. With comments open from Test 1.1
2. Ensure comments list is scrolled to the TOP (scrollY = 0)
3. Swipe DOWN on comments
4. **Expected:** Comments close smoothly

**Verify:**
- [ ] Comments only close when scrollY ≤ 0
- [ ] If scrollY > 0, swipe scrolls the list instead
- [ ] Article animates back to original size
- [ ] Dim overlay fades out
- [ ] FlatList paging re-enables

**Pass Criteria:**
- [ ] Animation reverses smoothly
- [ ] No jank
- [ ] Can now page to next article

---

#### Test 1.3: Reading → Dismissing
**Steps:**
1. From reading mode (comments closed)
2. Swipe DOWN on article
3. **Expected:** Detail screen dismisses, returns to home

**Verify:**
- [ ] Screen slides down
- [ ] Screen opacity fades
- [ ] Router navigates back to home

**Pass Criteria:**
- [ ] Smooth dismissal animation
- [ ] No crash
- [ ] Returns to correct home state

---

### 2. Direction Lock (8px Threshold)

#### Test 2.1: Horizontal Lock
**Steps:**
1. Open detail screen
2. Swipe horizontally MORE than vertically (within first 8px of movement)
3. **Expected:** Gesture locks to HORIZONTAL
4. Continue swiping horizontally
5. **Verify:** FlatList pages to next article (no vertical gesture)

**Pass Criteria:**
- [ ] Horizontal swipes page articles
- [ ] No vertical gesture triggered

---

#### Test 2.2: Vertical Lock
**Steps:**
1. Open detail screen
2. Swipe vertically MORE than horizontally (within first 8px)
3. **Expected:** Gesture locks to VERTICAL
4. Continue swiping up/down
5. **Verify:** Comments open/close or screen dismisses (no horizontal paging)

**Pass Criteria:**
- [ ] Vertical gestures work
- [ ] No horizontal paging

---

### 3. Threshold Testing

#### Test 3.1: Open Comments Threshold
**Steps:**
1. From reading mode
2. Swipe up LESS than 260px
3. Release
4. **Expected:** Comments do NOT open, snap back

**Then:**
1. Swipe up MORE than 260px
2. Release
3. **Expected:** Comments open

**Pass Criteria:**
- [ ] Threshold at 260px works correctly
- [ ] Snap back animation is smooth

---

#### Test 3.2: Close Comments Threshold
**Steps:**
1. With comments open (scrollY = 0)
2. Swipe down LESS than 220px
3. Release
4. **Expected:** Comments stay open, snap back

**Then:**
1. Swipe down MORE than 220px (from top)
2. Release
3. **Expected:** Comments close

**Pass Criteria:**
- [ ] Threshold at 220px works
- [ ] Snap back is smooth

---

#### Test 3.3: Dismiss Threshold
**Steps:**
1. From reading mode
2. Swipe down LESS than 0.22 × screenHeight
3. Release
4. **Expected:** Screen does NOT dismiss, snaps back

**Then:**
1. Swipe down MORE than 0.22 × screenHeight
2. Release
3. **Expected:** Screen dismisses

**Pass Criteria:**
- [ ] 22% threshold works
- [ ] Dismissal is smooth

---

### 4. Velocity Testing

#### Test 4.1: Fast Swipe Up (Open Comments)
**Steps:**
1. From reading mode
2. Quick, fast swipe UP (even if distance < 260px)
3. Release
4. **Expected:** If velocity < -900, comments open

**Pass Criteria:**
- [ ] Velocity override works
- [ ] Animation feels responsive

---

#### Test 4.2: Fast Swipe Down (Dismiss)
**Steps:**
1. From reading mode
2. Quick, fast swipe DOWN
3. Release
4. **Expected:** If velocity > 1200, screen dismisses

**Pass Criteria:**
- [ ] Velocity override works
- [ ] Dismissal feels snappy

---

### 5. Android Back Button

#### Test 5.1: Back in Comments Mode
**Steps (Android only):**
1. Open comments
2. Press hardware BACK button
3. **Expected:** Comments close (mode → reading)
4. **Verify:** Screen does NOT dismiss

**Pass Criteria:**
- [ ] Back button closes comments
- [ ] Screen stays open

---

#### Test 5.2: Back in Reading Mode
**Steps (Android only):**
1. From reading mode (comments closed)
2. Press hardware BACK button
3. **Expected:** Screen dismisses, returns to home

**Pass Criteria:**
- [ ] Back button dismisses screen
- [ ] Returns to home

---

### 6. Stress Tests

#### Test 6.1: Open/Close 20x
**Using Gesture Playground:**
1. Navigate to gesture playground
2. Open detail view
3. Press "🔥 Open/Close 20x" button
4. **Monitor:** Console logs, UI responsiveness

**Pass Criteria:**
- [ ] No crashes
- [ ] No memory leaks
- [ ] Animations remain smooth throughout
- [ ] No visual glitches

---

#### Test 6.2: Dismiss 10x
**Using Gesture Playground:**
1. In gesture playground
2. Press "🔥 Dismiss 10x" button
3. **Monitor:** Performance

**Pass Criteria:**
- [ ] No crashes
- [ ] Dismissal always works
- [ ] No navigation stack corruption

---

### 7. Edge Cases

#### Test 7.1: Comments Scroll Guard
**Steps:**
1. Open comments
2. Scroll down in comments list (scrollY > 0)
3. Try to swipe DOWN
4. **Expected:** List scrolls, comments do NOT close

**Then:**
1. Scroll back to top (scrollY = 0)
2. Swipe DOWN
3. **Expected:** Comments close

**Pass Criteria:**
- [ ] Can't close comments mid-scroll
- [ ] Can close when at top

---

#### Test 7.2: Rapid Mode Changes
**Steps:**
1. Open comments
2. Immediately close
3. Immediately open again
4. Repeat 5 times rapidly

**Pass Criteria:**
- [ ] No crashes
- [ ] Mode always correct
- [ ] Animations don't stack/conflict

---

#### Test 7.3: Multi-Touch
**Steps:**
1. Try gesture with 2 fingers
2. Try conflicting gestures (horizontal + vertical)

**Pass Criteria:**
- [ ] Gestures handle gracefully
- [ ] No crashes
- [ ] Direction lock wins

---

## Performance Metrics

Use React DevTools Profiler:

**Expected:**
- Opening comments: < 16ms per frame (60fps)
- Closing comments: < 16ms per frame
- Dismissing: < 16ms per frame
- Memory: Stable (no leaks after 20x stress test)

**Tools:**
- React DevTools (web debugging)
- Xcode Instruments (iOS)
- Android Studio Profiler (Android)

---

## Reporting Bugs

If any test fails, report with:

1. **Platform:** iOS / Android
2. **Test Case:** (e.g., Test 1.1)
3. **Expected:** (what should happen)
4. **Actual:** (what happened)
5. **Logs:** Console output
6. **Video:** Screen recording if possible

---

## Sign-Off

**Tester:** _______________  
**Date:** _______________  
**Platform:** iOS ☐ Android ☐  
**Build:** _______________  

**Overall Result:** ☐ PASS ☐ FAIL

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

**Last Updated:** 2026-01-10
