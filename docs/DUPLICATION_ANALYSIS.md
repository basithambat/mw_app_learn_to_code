# UI Duplication Analysis & Fix

## Duplication Found

### 1. MilestoneStep Widget (Unused)
**Location**: `lib/core/widgets/milestone_step.dart`
**Status**: Created earlier, but NOT being used in dashboard
**Purpose**: Reusable widget for milestone steps

### 2. Dashboard Custom Methods (Currently Used)
**Location**: `lib/features/will_steps/screens/dashboard_screen.dart`
**Methods**: `_buildStepCard()` and `_buildStepContent()`
**Status**: Currently being used, duplicates MilestoneStep functionality

### 3. ProgressStepper Widget (Unused)
**Location**: `lib/core/widgets/progress_stepper.dart`
**Status**: Created earlier, NOT being used

## Root Cause of Step 2 Navigation Issue

The issue is NOT the duplication, but the navigation logic:

**Problem**: When Step 1 is completed and user clicks "Get Started":
1. `_getCurrentStepIndex()` should return `1` (Step 2 is next)
2. But `_handleGetStarted()` navigates to `AppRoutes.family` for case 1
3. However, the route should work correctly

**Actual Issue**: The problem might be that:
- When onboarding completes, it navigates to dashboard
- But the dashboard might not be detecting that Step 1 is completed
- So `_getCurrentStepIndex()` still returns `0` instead of `1`

## Fix Strategy

1. **Keep current implementation** - The `_buildStepCard` and `_buildStepContent` methods match the Figma design exactly
2. **Remove unused widgets** - Delete `MilestoneStep` and `ProgressStepper` if not needed elsewhere
3. **Fix navigation logic** - Ensure state is properly updated after onboarding

## Files to Check

1. `dashboard_screen.dart` - Navigation logic
2. `onboarding_flow_screen.dart` - Completion flag passing
3. `app_routes.dart` - Route handling
