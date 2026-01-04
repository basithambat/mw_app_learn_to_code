# Progress Tracking & Flow Management Analysis

## ✅ YES - The App Tracks Progress and Shows Flows Accordingly!

### How Progress Tracking Works

#### 1. **Step Status Tracking**
The app tracks completion status for each of the 4 main steps:

```dart
{
  'stepBasicInfo': 'NOT_STARTED' | 'COMPLETED',
  'stepFamily': 'NOT_STARTED' | 'COMPLETED',
  'stepArrangements': 'NOT_STARTED' | 'COMPLETED',
  'stepAssets': 'NOT_STARTED' | 'COMPLETED',
}
```

**Location:** Stored in the `will` object, both in memory and backend

#### 2. **Current Step Detection**
The dashboard automatically determines which step the user should work on:

```dart
int _getCurrentStepIndex() {
  // Finds the first incomplete step
  for (int i = 0; i < steps.length; i++) {
    if (!_isStepCompleted(_will![steps[i]])) return i;
  }
  return steps.length; // All completed
}
```

**Result:** The "Get Started" button always navigates to the next incomplete step

#### 3. **Visual Progress Indicators**

**Dashboard Shows:**
- ✅ **Step Cards**: Numbered cards (1-4) with checkmarks when completed
- ✅ **Progress Lines**: 
  - Dark green lines for completed steps
  - Light green lines for pending steps
- ✅ **Step Descriptions**: Dynamic descriptions based on completion status
- ✅ **Edit Buttons**: Appear on the right when a step is completed
- ✅ **Button Text**: Changes to show next step (e.g., "Get Started - Family & inheritance")

**Visual Example:**
```
Step 1: ✅ [✓] Basic info
        ┃ (dark green - completed)
Step 2: ⭕ [2] Family & inheritance
        ┃ (light green - pending)
Step 3: ⭕ [3] Will arrangements
        ┃ (light green - pending)
Step 4: ⭕ [4] Accounts & properties
```

#### 4. **Automatic Flow Navigation**

**When a step is completed:**
1. Screen returns `{'stepCompleted': 'stepX'}`
2. Dashboard updates step status to 'COMPLETED'
3. Dashboard automatically navigates to next step (after 300ms delay)
4. Button text updates to show next step

**Example Flow:**
```
User completes Step 1 (Basic Info)
  ↓
Dashboard marks stepBasicInfo = 'COMPLETED'
  ↓
Button changes to "Get Started - Family & inheritance"
  ↓
User clicks → Navigates to Step 2
  ↓
User completes Step 2
  ↓
Dashboard marks stepFamily = 'COMPLETED'
  ↓
Automatically navigates to Step 3 (after 300ms)
```

#### 5. **Edit Completed Steps**

**When a step is completed:**
- An "Edit" button appears on the right side of the step
- Clicking "Edit" allows the user to modify that step
- After editing, the dashboard reloads data to reflect changes

### Progress Persistence

#### ✅ **Backend Persistence** (When API is available)

**Step Status is Saved:**
- `OnboardingFlowScreen` → Calls `updateWill()` with `stepBasicInfo: 'COMPLETED'`
- `ArrangementsScreen` → Calls `updateWill()` with `stepArrangements: 'COMPLETED'`
- `FamilyScreen` → Returns completion status, dashboard updates via API

**API Endpoint:**
```dart
await _willService.updateWill(willId, {
  'stepBasicInfo': 'COMPLETED',
  // ... other fields
});
```

#### ⚠️ **Demo Mode Persistence** (When API is unavailable)

**In-Memory Only:**
- Step status is stored in `_will` object in memory
- Persists during the current app session
- **Lost on app restart** (unless backend is available)

### Flow Examples

#### Example 1: New User Journey
```
1. User opens app → Dashboard shows Step 1 as current
2. Button says "Get Started - Basic info"
3. User completes onboarding → Step 1 marked COMPLETED
4. Dashboard automatically shows Step 2 as current
5. Button changes to "Get Started - Family & inheritance"
6. User can continue or come back later
```

#### Example 2: Returning User
```
1. User opens app → Dashboard loads will from API
2. Sees Step 1 ✅, Step 2 ✅, Step 3 ⭕ (incomplete)
3. Button says "Get Started - Will arrangements"
4. User clicks → Goes to Step 3
5. Completes Step 3 → Automatically goes to Step 4
```

#### Example 3: Editing Previous Step
```
1. User has completed Steps 1-3
2. Wants to edit Step 1
3. Clicks "Edit" button next to Step 1
4. Makes changes and saves
5. Dashboard reloads data
6. Step 1 still shows as completed
7. Can continue from Step 4
```

### What Gets Tracked

#### ✅ **Tracked:**
- Step completion status (4 main steps)
- Current step position
- Visual progress indicators
- Navigation flow

#### ❌ **Not Tracked (Yet):**
- Sub-step progress within each main step
  - Example: Within "Family & Inheritance", which sub-screens are completed?
- Partial completion status
  - Example: User added spouse but not children
- Time spent on each step
- Last accessed date/time

### Code Locations

**Progress Tracking:**
- `apps/mobile_web/lib/features/will_steps/screens/dashboard_screen.dart`
  - `_getCurrentStepIndex()` - Determines current step
  - `_isStepCompleted()` - Checks if step is done
  - `_handleGetStarted()` - Navigates to next step

**Step Completion:**
- `basic_info_screen.dart` → Returns `{'stepCompleted': 'stepBasicInfo'}`
- `family_screen.dart` → Returns `{'stepCompleted': 'stepFamily'}`
- `arrangements_screen.dart` → Returns `{'stepCompleted': 'stepArrangements'}`
- `assets_screen.dart` → Returns `{'stepCompleted': 'stepAssets'}`

**Backend Updates:**
- `onboarding_flow_screen.dart` → `updateWill()` with step status
- `arrangements_screen.dart` → `updateWill()` with step status
- Dashboard → `updateWill()` when step is completed

### Recommendations

#### ✅ **Current Implementation is Good:**
- Progress tracking works
- Visual indicators are clear
- Flow navigation is automatic
- Edit functionality exists

#### 🔶 **Potential Enhancements:**

1. **Sub-Step Tracking**
   - Track progress within each main step
   - Example: "Family & Inheritance: 2/4 completed"

2. **Progress Persistence in Demo Mode**
   - Use `shared_preferences` to save progress locally
   - Restore on app restart

3. **Progress Analytics**
   - Track time spent on each step
   - Identify where users drop off

4. **Resume Functionality**
   - "Continue where you left off" button
   - Jump directly to incomplete step

5. **Progress Validation**
   - Check if all required data is filled before marking complete
   - Show warnings for incomplete data

## Conclusion

**✅ YES - The app DOES track user progress and shows flows accordingly!**

**Features:**
- ✅ Tracks completion status for all 4 main steps
- ✅ Shows visual progress indicators
- ✅ Automatically navigates to next incomplete step
- ✅ Allows editing completed steps
- ✅ Saves progress to backend (when available)
- ✅ Adapts button text based on current step

**The app is ready for users to track their progress through the will creation flow!**
