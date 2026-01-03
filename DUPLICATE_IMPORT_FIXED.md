# ✅ Fixed: Duplicate Import Error

## 🐛 Error
```
SyntaxError: Identifier 'ArticleComment' has already been declared.
Location: redux/slice/articlesComments.ts:4:9
```

## 🔍 Root Cause
`ArticleComment` was imported **twice**:
- Line 1: `import { ArticleComment } from '@/types';`
- Line 4: `import { ArticleComment } from '@/app/types';`

## ✅ Fix Applied
1. **Removed duplicate import** from `@/types` (line 1)
2. **Kept correct import** from `@/app/types` (where `ArticleComment` is actually defined)
3. **Removed duplicate selector** `commentsDataSelector` that was declared twice

## 📝 Changes Made
- Removed: `import { ArticleComment } from '@/types';`
- Kept: `import { ArticleComment } from '@/app/types';`
- Removed duplicate `commentsDataSelector` export

---

## 🎯 Status
✅ **Error fixed!** Metro should now compile successfully.

The app should reload automatically. If not, check your terminal for Metro logs.

---

**The duplicate import has been resolved!** 🚀
