# Pending Screens & Features

## ✅ ALL SCREENS COMPLETE!

### Critical Screens - ALL COMPLETE
- ✅ Jewellery Photo Capture Screen - **BUILT**
- ✅ Investments Sync Progress Screen - **BUILT**

### Additional Screens - ALL COMPLETE
- ✅ Transfer To Selection Modal - **BUILT** (reusable component)
- ✅ Add Charity/Friend Screen - **BUILT**
- ✅ Edit/Add Mother Screen - **BUILT**
- ✅ Add Others Screen - **BUILT**
- ✅ Photo Picker Integration - **IMPLEMENTED** (in spouse/child/guardian screens)

## 🔶 Previously Pending (Now Complete)

### 1. **Transfer To Selection Modals** (4-5 modals)
**Status:** Placeholder functionality exists, needs proper modals

**Locations:**
- `jewellery_details_screen.dart` - Line 186: `// Select transfer to`
- `add_gadget_details_screen.dart` - Line 130: `_selectTransferTo()` function exists but shows simple dialog
- `business_details_screen.dart` - Line 180: `// Select transfer to`
- `household_items_screen.dart` - Line 120: `// Select transfer to`

**Required:** Create reusable modal similar to `RealEstateInheritanceModal` and `VehicleNomineeModal` that:
- Shows list of eligible heirs with profile pictures
- Allows multiple selection (for some assets) or single selection (for others)
- Returns selected heir(s) name(s)

**Priority:** Medium (functionality works but UX incomplete)

---

### 2. **Add Charity/Friend Screen** (1 screen)
**Status:** TODO present, shows "coming soon" snackbar

**Location:** `inheritance_no_survivors_screen.dart` - Line 234

**Required:** Screen/modal to add charity or friend as beneficiary when no family members survive

**Priority:** Medium (edge case but important for complete flow)

---

### 3. **Edit/Add Mother Screen** (1 screen)
**Status:** TODOs present

**Location:** `family_screen.dart` - Lines 422, 430

**Required:** 
- Edit mother screen (similar to Add Spouse/Child)
- Add mother screen (if not already added)

**Priority:** Low (can use existing Add Spouse screen pattern)

---

### 4. **Add Others Screen** (1 screen)
**Status:** TODO present

**Location:** `family_screen.dart` - Line 448

**Required:** Screen to add other family members (brothers, sisters, etc.)

**Priority:** Low (can use existing Add Spouse/Child pattern)

---

### 5. **Photo Picker Integration** (Feature, not new screen)
**Status:** TODOs present, placeholder functionality exists

**Locations:**
- `add_spouse_screen.dart` - Line 51
- `add_child_screen.dart` - Line 53
- `add_guardian_screen.dart` - Line 65

**Required:** Replace placeholder with actual `image_picker` implementation (already in dependencies)

**Priority:** Low (nice-to-have, placeholder works)

---

## Summary

**Actual New Screens Needed:**
1. Transfer To Selection Modal (reusable component) - **4-5 instances**
2. Add Charity/Friend Screen - **1 screen**
3. Edit/Add Mother Screen - **1 screen** (or reuse existing)
4. Add Others Screen - **1 screen** (or reuse existing)

**Total: 1-3 new screens + 1 reusable modal component**

**Features to Enhance:**
- Photo picker integration (3 locations)
- Transfer to selection (4-5 locations)

**Priority Order:**
1. **High:** Transfer To Selection Modal (affects 4-5 screens)
2. **Medium:** Add Charity/Friend Screen
3. **Low:** Photo picker, Edit/Add Mother, Add Others
