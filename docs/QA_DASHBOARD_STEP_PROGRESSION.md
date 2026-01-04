# QA Report: Dashboard Step Progression Issues

## Issue Summary
After completing Step 1 (Basic Info), the dashboard does not:
1. Update the bottom panel to show the next step
2. Update the CTA button label to reflect the next step
3. Correctly reflect completion in the progress bar

## Reproduction Steps

### Scenario 1: Completing Step 1 via Onboarding Flow
1. User completes onboarding flow (name, DOB, spouse, children, minors)
2. Onboarding flow marks `stepBasicInfo: 'COMPLETED'` in backend
3. User navigates to dashboard
4. **Expected**: Bottom panel shows "Next step: Family & inheritance"
5. **Actual**: Bottom panel still shows "Next step: Basic info"

### Scenario 2: Completing Step 1 via BasicInfoScreen
1. User clicks "Get Started" on dashboard
2. User fills Basic Info form
3. User saves and returns to dashboard
4. **Expected**: Bottom panel updates to "Next step: Family & inheritance", CTA navigates to Step 2
5. **Actual**: Bottom panel may not update immediately, CTA still says "Get Started"

## Root Cause Analysis

### Issue 1: State Not Reloaded After Onboarding
**Location**: `dashboard_screen.dart` - `didChangeDependencies()`
**Problem**: When coming from onboarding, the dashboard relies on `widget.onboardingCompleted` flag, but this only works if the flag is passed. The will state might not be reloaded from API.

**Code**:
```dart
if (widget.onboardingCompleted && _will != null && !_isLoading) {
  if (_will!['stepBasicInfo'] != 'COMPLETED') {
    // Only updates in-memory state, doesn't reload from API
    setState(() {
      _will!['stepBasicInfo'] = 'COMPLETED';
    });
  }
}
```

### Issue 2: CTA Button Always Shows "Get Started"
**Location**: `dashboard_screen.dart` - Line 693
**Problem**: The button text is hardcoded to "Get Started" instead of being dynamic based on current step.

**Code**:
```dart
child: Text(
  'Get Started', // Hardcoded!
  style: GoogleFonts.frankRuhlLibre(...),
),
```

### Issue 3: State Update Timing
**Location**: `dashboard_screen.dart` - `_handleGetStarted()` method
**Problem**: After updating step status, `setState()` is called, but `_getCurrentStepIndex()` and `_getNextStepTitle()` might be evaluated before the state update completes.

### Issue 4: API Mode State Not Synced
**Location**: `dashboard_screen.dart` - Line 199
**Problem**: In API mode, `_loadWill()` is called, but this is async and might not complete before the UI rebuilds.

## Expected vs Actual Behavior

| Step | Action | Expected Behavior | Actual Behavior | Status |
|------|--------|------------------|-----------------|--------|
| 1 | Complete Step 1 | Bottom panel: "Next step: Family & inheritance"<br>CTA: "Get Started" (navigates to Step 2)<br>Progress: Step 1 shows checkmark | Bottom panel: "Next step: Basic info"<br>CTA: "Get Started" (navigates to Step 1 again)<br>Progress: Step 1 may not show checkmark | ❌ FAIL |
| 2 | Complete Step 2 | Bottom panel: "Next step: Will arrangements"<br>CTA: "Get Started" (navigates to Step 3)<br>Progress: Step 2 shows checkmark | Bottom panel: Updates correctly<br>CTA: "Get Started"<br>Progress: Updates correctly | ⚠️ PARTIAL |
| 3 | Complete Step 3 | Bottom panel: "Next step: Accounts & properties"<br>CTA: "Get Started" (navigates to Step 4)<br>Progress: Step 3 shows checkmark | Bottom panel: Updates correctly<br>CTA: "Get Started"<br>Progress: Updates correctly | ⚠️ PARTIAL |
| 4 | Complete Step 4 | Bottom panel: "Complete"<br>CTA: Disabled or "View Will"<br>Progress: All steps show checkmarks | Bottom panel: Updates correctly<br>CTA: Still says "Get Started"<br>Progress: Updates correctly | ⚠️ PARTIAL |

## Code-Level Issues

### File: `apps/mobile_web/lib/features/will_steps/screens/dashboard_screen.dart`

#### Issue 1: Hardcoded CTA Button Text
**Line**: 693
```dart
// Current (WRONG):
child: Text('Get Started', ...)

// Should be:
child: Text(_getCTAButtonText(), ...)
```

#### Issue 2: State Not Reloaded on Return from Onboarding
**Line**: 47-84
**Problem**: `_loadWill()` is only called in `initState()`, not when returning from onboarding.

**Fix**: Add `didChangeDependencies()` or override `didUpdateWidget()` to reload when needed.

#### Issue 3: Async State Update Race Condition
**Line**: 134-142
**Problem**: `setState()` is called, but the UI rebuild might happen before `_getCurrentStepIndex()` reflects the new state.

**Fix**: Ensure state is updated before calling `setState()`, or use a callback.

#### Issue 4: Missing State Persistence Check
**Line**: 194-201
**Problem**: In demo mode, state is updated, but in API mode, `_loadWill()` is async and might not complete.

**Fix**: Show loading state or ensure state is updated synchronously before async reload.

## UX Improvements

### 1. Dynamic CTA Button Text
- **Current**: Always shows "Get Started"
- **Proposed**: 
  - Step 1-3: "Continue to [Next Step Name]"
  - Step 4: "Complete Will"
  - All Complete: "View Will" or disable button

### 2. Progress Bar Animation
- **Current**: Static progress lines
- **Proposed**: Animate progress bar when step completes

### 3. Visual Feedback on Step Completion
- **Current**: Checkmark appears
- **Proposed**: Add subtle animation or highlight when step completes

### 4. Bottom Panel Update Animation
- **Current**: Instant update (if it works)
- **Proposed**: Smooth transition animation when next step changes

## Fix Plan

### Priority 1: Critical Fixes

1. **Fix State Reload After Onboarding**
   - Add `didUpdateWidget()` to reload will when returning from onboarding
   - Ensure `_loadWill()` is called when dashboard becomes visible again

2. **Fix CTA Button Text**
   - Create `_getCTAButtonText()` method
   - Make button text dynamic based on current step

3. **Fix State Update Timing**
   - Ensure `setState()` is called after state is fully updated
   - Use `WidgetsBinding.instance.addPostFrameCallback()` if needed

### Priority 2: UX Improvements

4. **Add Loading State**
   - Show loading indicator when reloading will data
   - Prevent button clicks during state update

5. **Add Completion Animation**
   - Animate checkmark appearance
   - Animate progress bar update

### Priority 3: Edge Cases

6. **Handle API Failures**
   - Fallback to demo mode if API fails
   - Show error message if state can't be loaded

7. **Handle All Steps Complete**
   - Disable CTA button or change to "View Will"
   - Show completion message

## Files to Modify

1. `apps/mobile_web/lib/features/will_steps/screens/dashboard_screen.dart`
   - Add `_getCTAButtonText()` method
   - Fix `_handleGetStarted()` state update
   - Add `didUpdateWidget()` or improve `didChangeDependencies()`
   - Fix async state reload

2. `apps/mobile_web/lib/features/onboarding/screens/onboarding_flow_screen.dart`
   - Ensure it passes completion flag to dashboard
   - Ensure it marks step as completed in backend

3. `apps/mobile_web/lib/features/will_steps/screens/basic_info_screen.dart`
   - Ensure it returns correct completion status
   - Ensure it marks step as completed

## Testing Checklist

- [ ] Complete Step 1 via onboarding → Verify bottom panel updates
- [ ] Complete Step 1 via BasicInfoScreen → Verify bottom panel updates
- [ ] Complete Step 2 → Verify bottom panel updates to Step 3
- [ ] Complete Step 3 → Verify bottom panel updates to Step 4
- [ ] Complete Step 4 → Verify bottom panel shows "Complete"
- [ ] Refresh app → Verify state persists
- [ ] Test in demo mode → Verify state updates
- [ ] Test in API mode → Verify state syncs with backend
- [ ] Test CTA button navigation → Verify it goes to correct step
- [ ] Test progress bar → Verify it updates correctly
