# React to Flutter Screen Conversion Checklist

## Overview

This checklist provides a step-by-step guide for converting each React screen to Flutter, ensuring all UI elements, interactions, and styling are properly implemented.

## Pre-Conversion Setup

### Required Dependencies
- [ ] Add `flutter_svg` package for SVG support
- [ ] Add custom fonts (Frank Ruhl Libre, Lato) to `pubspec.yaml`
- [ ] Update `AppTheme` with React color palette
- [ ] Create reusable widget components (PersonCard, PrimaryButton, etc.)

### Theme Updates
- [ ] Update primary color to `#0F361F` (dark green)
- [ ] Update accent color to `#09B852` (bright green)
- [ ] Add light green background colors (`#E3EAE6`, `#E7F1EB`)
- [ ] Update text colors to match React (`#242424`, `#707070`)
- [ ] Update border colors to `rgba(0,0,0,0.12)`

## Screen Conversion Checklists

### 1. Splash Screen (`SplashSequence.tsx`)

**Status**: Already implemented as `AnimatedSplashScreen`

- [x] Logo animation (3 states)
- [x] Text fade-in animation
- [x] Progress bar animation
- [ ] Verify colors match React version
- [ ] Verify timing matches React version

### 2. Welcome/Login Screen (`WelcomeScreen.tsx`)

**Target**: Enhance `LoginScreen`

- [ ] Add background image/gradient
- [ ] Add "Continue with Phone number" button
- [ ] Add Google OAuth button
- [ ] Add Facebook OAuth button
- [ ] Add terms & conditions text at bottom
- [ ] Match exact layout and spacing
- [ ] Add status bar styling
- [ ] Verify button styles match React

### 3. Dashboard Screen (`WillMilestonesDashboard.tsx`)

**Target**: Enhance `DashboardScreen`

- [ ] Add decorative background element (top-right)
- [ ] Add logo and title section (top-left)
- [ ] Implement 4 milestone steps with:
  - [ ] Step 1: Basic Info (completed state with checkmark)
  - [ ] Step 2: Family & Inheritance (current state with number)
  - [ ] Step 3: Will Arrangements (incomplete state)
  - [ ] Step 4: Accounts & Properties (incomplete state)
- [ ] Add vertical line connectors between steps
- [ ] Add divider lines between steps
- [ ] Add "Edit" button for completed step
- [ ] Add bottom action bar (dark green) with:
  - [ ] "Next step" label
  - [ ] Step name
  - [ ] "Get Started" button
- [ ] Match exact colors and spacing
- [ ] Verify step status indicators

### 4. Family & Inheritance Screen (`FamilyInheritance.tsx`)

**Target**: Complete `FamilyScreen`

- [ ] Add decorative background element
- [ ] Add back button (top-left)
- [ ] Add title and description
- [ ] Implement Spouse card:
  - [ ] Empty state: Placeholder with "Add" button
  - [ ] Filled state: Photo + Name + Relationship + "Edit" button
- [ ] Implement Children card:
  - [ ] Empty state: Placeholder with "Add" button
  - [ ] Filled state: Photo + Name + "Edit" button
- [ ] Implement Mother card:
  - [ ] Card with light gray background
  - [ ] White nested card with "Add" button
  - [ ] Explanatory text below
- [ ] Implement Others card:
  - [ ] Card with light gray background
  - [ ] White nested card with "Add" button
  - [ ] Explanatory text below
- [ ] Add "Decide who gets how much" button at bottom
- [ ] Disable continue button until at least one member added
- [ ] Match exact card heights (76px for filled, 64px for empty)
- [ ] Verify spacing between cards

### 5. Add Spouse Screen (`AddSpouse.tsx`)

**Target**: Create new screen or enhance existing

- [ ] Add back button
- [ ] Add title and description
- [ ] Add form fields:
  - [ ] Name input
  - [ ] Date of birth picker
  - [ ] Relationship selector (husband/wife)
  - [ ] Photo upload option
- [ ] Add "Save" button
- [ ] Add form validation
- [ ] Match exact styling

### 6. Add Child Screen (`AddChild.tsx`)

**Target**: Create new screen

- [ ] Add back button
- [ ] Add title with child number
- [ ] Add form fields:
  - [ ] Name input
  - [ ] Date of birth picker
  - [ ] Relationship selector (son/daughter)
  - [ ] Photo upload option
- [ ] Add "Save" button
- [ ] Add form validation
- [ ] Check if child is minor and show guardian recommendation

### 7. Inheritance Scenario Screens (`DistributionScenario1.tsx`, `DistributionScenario2.tsx`)

**Target**: Complete `InheritanceScreen`

- [ ] Add back button
- [ ] Add title and description
- [ ] Implement scenario 1: User dies first
  - [ ] Show spouse card
  - [ ] Add percentage slider
  - [ ] Show percentage display
- [ ] Implement scenario 2: Spouse dies first
  - [ ] Show children cards
  - [ ] Add percentage sliders for each child
  - [ ] Show percentage displays
- [ ] Implement scenario 3: No one survives
  - [ ] Show children cards
  - [ ] Add percentage sliders
- [ ] Add validation: Total must equal 100%
- [ ] Add "Next" button
- [ ] Match exact slider styling
- [ ] Verify percentage calculations

### 8. Heirs Screen (`HeirsScreen.tsx`)

**Target**: Create new screen or add to existing

- [ ] Add back button
- [ ] Add title and description
- [ ] Show Spouse card with photo and name
- [ ] Show Children card with:
  - [ ] Multiple photos (overlapping)
  - [ ] Combined names
  - [ ] "Edit" button that opens modal
- [ ] Show Mother card with:
  - [ ] Photo and name
  - [ ] Explanatory text
- [ ] Show "Someone else" card (optional)
- [ ] Add children detail modal:
  - [ ] Dark overlay
  - [ ] Bottom sheet with list of children
  - [ ] Each child with photo, name, relationship, DOB
  - [ ] "Add" button (top-right)
  - [ ] "Done" button (bottom)
- [ ] Add "Decide who gets how much" button
- [ ] Match exact card styling

### 9. Assign Executor Screen (`AssignExecutor.tsx`)

**Target**: Enhance `ArrangementsScreen`

- [ ] Add back button
- [ ] Add progress bar (top)
- [ ] Add title and description
- [ ] Show Spouse option (if exists):
  - [ ] Card with photo and name
  - [ ] Radio button or selection indicator
- [ ] Show Mother option (if exists):
  - [ ] Card with photo and name
  - [ ] Radio button
- [ ] Show "Add other" option:
  - [ ] Card with placeholder
  - [ ] "Add" button
- [ ] Add "Show duties" button/link
- [ ] Add "Continue" button
- [ ] Implement executor selection logic
- [ ] Match exact card styling

### 10. Add Witness Screen (`AddWitnessScreen.tsx`)

**Target**: Enhance `ArrangementsScreen`

- [ ] Add back button
- [ ] Add progress bar (top)
- [ ] Add title and description
- [ ] Implement Witness 1 slot:
  - [ ] Empty state: Outlined button "Add first witness"
  - [ ] Filled state: Card with W1 badge, name, email, edit button
- [ ] Implement Witness 2 slot:
  - [ ] Empty state: Outlined button "Add second witness"
  - [ ] Filled state: Card with W2 badge, name, email, edit button
- [ ] Add "Save & Continue" button (disabled until both added)
- [ ] Match exact card styling (76px height)
- [ ] Verify badge styling (W1, W2)

### 11. Add Witness Form (`AddWitnessForm.tsx`)

**Target**: Create new screen or dialog

- [ ] Add back button
- [ ] Add title with witness number
- [ ] Add form fields:
  - [ ] Name input
  - [ ] Email input
  - [ ] Phone input (optional)
  - [ ] Relationship input
- [ ] Add "Save" button
- [ ] Add form validation
- [ ] Match exact styling

### 12. Add Signature Screen (`AddSignature.tsx`)

**Target**: Create new screen

- [ ] Add back button
- [ ] Add title and description
- [ ] Add "Take or upload photo" option
- [ ] Add "Add sign digitally" option
- [ ] Match exact button styling
- [ ] Implement navigation to signature canvas

### 13. Signature Canvas (`SignatureCanvas.tsx`)

**Target**: Create new screen

- [ ] Add back button
- [ ] Add signature drawing canvas
- [ ] Add "Clear" button
- [ ] Add "Continue" button
- [ ] Implement signature capture
- [ ] Match exact styling

### 14. Assets Overview Screen (`AssetsOverview.tsx`)

**Target**: Enhance `AssetsScreen`

- [ ] Add back button
- [ ] Add top section (light green background):
  - [ ] Title "Properties & accounts"
  - [ ] Description
  - [ ] Three benefit cards with icons and text
- [ ] Add bottom sheet (scrollable):
  - [ ] Drag handle
  - [ ] List of asset categories:
    - [ ] Real-estate
    - [ ] Personal business
    - [ ] Jewellery
    - [ ] Investments
    - [ ] Liabilities
    - [ ] Vehicles
    - [ ] Gadgets
    - [ ] Household items
  - [ ] Each category with:
    - [ ] Icon placeholder
    - [ ] Title and description
    - [ ] Toggle switch (if enabled) or "Add" button
- [ ] Implement category toggle logic
- [ ] Match exact styling and colors
- [ ] Verify bottom sheet drag behavior

## Reusable Components to Create

### PersonCard Widget
- [ ] Create `PersonCard` widget
- [ ] Support empty and filled states
- [ ] Include photo, name, relationship
- [ ] Include edit button
- [ ] Match exact styling (76px height, padding, etc.)

### PrimaryButton Widget
- [x] Already exists, but verify:
  - [ ] Matches React dark green color
  - [ ] Matches React height (56px)
  - [ ] Matches React font (Frank Ruhl Libre, bold, 16px)
  - [ ] Matches React width (320px for full width)

### EditButton Widget
- [ ] Create `EditButton` widget
- [ ] Light green background with opacity
- [ ] Green text
- [ ] Small padding
- [ ] Rounded corners

### SectionTitle Widget
- [ ] Create reusable title section widget
- [ ] Title (Frank Ruhl Libre, bold, 24px)
- [ ] Description (Lato, 14px, gray)
- [ ] Consistent spacing

### ProgressBar Widget
- [ ] Create progress bar widget
- [ ] Horizontal bar with percentage
- [ ] Dark green filled portion
- [ ] Light gray background
- [ ] Optional step indicators (dots)

### BottomSheet Widget
- [ ] Create reusable bottom sheet widget
- [ ] Drag handle
- [ ] Rounded top corners
- [ ] Scrollable content
- [ ] Dark overlay

## Testing Checklist

### Visual Testing
- [ ] Compare each screen side-by-side with React version
- [ ] Verify colors match exactly
- [ ] Verify spacing matches exactly
- [ ] Verify font sizes and weights
- [ ] Verify border radius values
- [ ] Verify card heights and padding

### Functional Testing
- [ ] Test all navigation flows
- [ ] Test form validation
- [ ] Test button states (enabled/disabled)
- [ ] Test modal/sheet interactions
- [ ] Test scroll behavior
- [ ] Test responsive behavior (if applicable)

### Interaction Testing
- [ ] Test button presses
- [ ] Test form submissions
- [ ] Test slider interactions
- [ ] Test toggle switches
- [ ] Test modal open/close
- [ ] Test bottom sheet drag

## Final Verification

- [ ] All screens match React design
- [ ] All colors match React palette
- [ ] All typography matches React fonts
- [ ] All spacing matches React values
- [ ] All interactions work correctly
- [ ] No business logic copied from React
- [ ] All Flutter services integrated correctly
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Empty states implemented

## Notes

1. **No Business Logic**: Only copy UI components, layouts, and styling. Use existing Flutter services for data operations.

2. **State Management**: Use Flutter's Provider or existing state management, not React patterns.

3. **Navigation**: Use Flutter's navigation system, not React Router.

4. **Form Validation**: Use Flutter's form validation, not React Hook Form.

5. **API Integration**: Use existing Flutter services, don't copy React API calls.

6. **Font Loading**: Ensure custom fonts are properly loaded in `pubspec.yaml`.

7. **Image Assets**: Convert Figma image paths to Flutter asset images.

8. **SVG Support**: Use `flutter_svg` package for SVG graphics.
