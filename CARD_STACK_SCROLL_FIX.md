# ✅ Card Stack Scrolling Fix

## 🐛 Issue

**Problem:** Cannot scroll to the third news item in card stack
- Can scroll to second news item
- Cannot scroll beyond second item

---

## 🔍 Root Cause

The `useCombinedSwipe` hook was intercepting horizontal gestures and:
1. **Disabling FlatList scrolling** (`setScrollEnabled(false)`) during horizontal swipes
2. **Trying to handle scrolling manually** via `scrollToIndex`, which doesn't work reliably for all items
3. **PanResponder interfering** with FlatList's native horizontal scrolling

---

## ✅ Fixes Applied

### 1. **Removed Horizontal Gesture Interception**
- PanResponder no longer intercepts horizontal gestures
- FlatList now handles horizontal scrolling natively

### 2. **Added Scroll Fallback**
- Added `onScrollToIndexFailed` handler for better error recovery
- Added `removeClippedSubviews={false}` to ensure all items are rendered

### 3. **Improved Scroll Handling**
- FlatList now handles all horizontal scrolling naturally
- PanResponder only handles vertical gestures (swipe up/down)

---

## 📋 Changes Made

### `hooks/useCombined.ts`
- **Removed:** `setScrollEnabled(false)` on horizontal gestures
- **Changed:** PanResponder only handles vertical gestures
- **Result:** FlatList can scroll horizontally without interference

### `components/ExpandNewsItem.tsx`
- **Added:** `removeClippedSubviews={false}` - ensures all items are rendered
- **Added:** `onScrollToIndexFailed` - fallback for scroll errors
- **Improved:** Scroll index bounds checking

---

## 🚀 Expected Behavior

After fix:
- ✅ Can scroll to all news items (1st, 2nd, 3rd, 4th, etc.)
- ✅ Smooth horizontal scrolling
- ✅ Vertical gestures (swipe up/down) still work
- ✅ No interference between PanResponder and FlatList

---

## 📱 Testing

1. Open a news card stack
2. Swipe left/right horizontally
3. Should be able to scroll through all items
4. Vertical swipes (up/down) should still work

---

**Card stack scrolling fixed! You can now scroll to all news items.** 🚀
