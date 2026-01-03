# ✅ SortBy Property Error - Fixed!

## 🔍 Issue

**Error:** "property sortby doesn't exist" at line 161

**Cause:** `sortBy` was being used but never defined with `useSelector`

---

## ✅ What I Fixed

**Added missing `sortBy` selector:**

```typescript
const sortBy = useSelector(sortBySelector);
```

**Now `sortBy` is properly defined and can be used in:**
- Line 143: `apigetAllComments(postId, token || undefined, sortBy)`
- Line 161: `useEffect` dependency array
- Lines 302, 306, 319, 323: Sort button styling

---

## ✅ Status

- ✅ `sortBy` now properly defined
- ✅ Redux selector connected
- ✅ Error should be resolved

---

**The app should reload and the error should be gone!** 🚀
