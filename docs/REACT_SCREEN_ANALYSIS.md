# React Screen Analysis for Flutter Conversion

## Repository Overview

**Repository**: https://github.com/futureflux/Mwreact.git  
**Tech Stack**: React 18+ with TypeScript, Vite, Radix UI, Tailwind CSS  
**Component Location**: `src/app/components/`  
**UI Components**: `src/app/components/ui/` (Radix UI based)

## Screen Inventory

### Core Screens Identified

#### 1. **Splash/Onboarding Flow**
- `SplashSequence.tsx` - Animated splash screen (3 states)
- `WelcomeScreen.tsx` - Welcome/login screen with OAuth options
- `OnboardingName.tsx` - Name and gender input
- `OnboardingDOB.tsx` - Date of birth picker
- `OnboardingSpouse.tsx` - Spouse question
- `OnboardingChildren.tsx` - Children question
- `OnboardingMinors.tsx` - Minors question
- `OnboardingAssets.tsx` - Asset categories selection
- `VideoExplainer.tsx` - Video explanation screen
- `ReligionSelection.tsx` - Religion selection

#### 2. **Dashboard**
- `WillMilestonesDashboard.tsx` - Main dashboard with 4 milestone steps
- `ProgressDashboard.tsx` - Progress tracking dashboard

#### 3. **Family & Inheritance**
- `FamilyInheritance.tsx` - Family members management screen
- `AddSpouse.tsx` - Add/edit spouse form
- `ChildrenCountSheet.tsx` - Children count selection
- `AddChild.tsx` - Add child form
- `RecommendationToAddGuardian.tsx` - Guardian recommendation modal
- `AddGuardian.tsx` - Add guardian form
- `DistributionNoticeModal.tsx` - Distribution notice
- `DistributionScenario1.tsx` - Scenario 1: User dies first
- `DistributionScenario2.tsx` - Scenario 2: Spouse dies first / No one survives
- `InheritanceSummary.tsx` - Inheritance summary screen
- `HeirsScreen.tsx` - Heirs overview screen

#### 4. **Will Arrangements**
- `AssignExecutor.tsx` - Executor assignment screen
- `AddExecutor.tsx` - Add custom executor form
- `DutiesModal.tsx` - Executor duties modal
- `AddWitnessScreen.tsx` - Witness management screen
- `AddWitnessForm.tsx` - Add witness form
- `AddSignature.tsx` - Signature options screen
- `SignatureCanvas.tsx` - Signature drawing canvas
- `VideoConsent.tsx` - Video consent screen
- `VideoConsentRecording.tsx` - Video recording screen

#### 5. **Will Preview & Completion**
- `WillReadySuccess.tsx` - Will completion success screen
- `WillPreview.tsx` - Will PDF preview
- `WillPreviewLastPage.tsx` - Will preview last page

#### 6. **Assets & Properties**
- `AssetsOverview.tsx` - Assets overview with categories
- `LocationPicker.tsx` - Location picker for real estate
- `EstateDetails.tsx` - Estate details form
- `MyEstates.tsx` - Estates list screen
- `PropertiesSummary.tsx` - Properties summary
- `VehicleRegistration.tsx` - Vehicle registration input
- `VehicleConfirmation.tsx` - Vehicle confirmation screen
- `VehicleDetails.tsx` - Vehicle details form
- `VehicleValueSheet.tsx` - Vehicle value selector
- `GadgetsCategory.tsx` - Gadget category selection
- `GadgetPhotoCapture.tsx` - Gadget photo capture
- `GadgetDetails.tsx` - Gadget details form
- `MyGadgets.tsx` - Gadgets list screen
- `JewelleryAssetType.tsx` - Jewellery type selection
- `JewelleryDetails.tsx` - Jewellery details form
- `JewelleryPhotoCapture.tsx` - Jewellery photo capture
- `MyJewellery.tsx` - Jewellery list screen
- `LiabilitiesAutoTrack.tsx` - Liabilities auto-track option
- `LiabilitiesConfirmDetails.tsx` - Liabilities confirmation
- `LiabilitiesSummary.tsx` - Liabilities summary
- `InvestmentsAutoTrack.tsx` - Investments auto-track option
- `InvestmentsTrackConsent.tsx` - Investments consent
- `InvestmentsConfirmDetails.tsx` - Investments confirmation
- `InvestmentsRequestInitiated.tsx` - Investments request status
- `InvestmentsSummary.tsx` - Investments summary
- `PersonalBusinessType.tsx` - Business type selection
- `SelfEmployedBusinessDetails.tsx` - Business details form

## Screen Structure Patterns

### Common Layout Structure

```
Screen Container
├── Status Bar (24px height, black opacity)
├── Decorative Background Element (optional)
├── Back Button (top-left, 24x24px)
├── Progress Bar (optional, top area)
├── Title Section
│   ├── Label (small text, bold)
│   ├── Title (h2, Frank Ruhl Libre, 32px)
│   └── Description (Lato, 14px, gray)
├── Content Area
│   ├── Form Fields / Cards / Lists
│   └── Action Buttons
└── Bottom Action Bar (optional, dark green background)
```

### Color Palette (from theme.css and components)

- **Primary Green**: `#0f361f` / `#0e371f` (dark green)
- **Accent Green**: `#09b852` (bright green)
- **Background**: `#ffffff` (white)
- **Light Green**: `#e3eae6` / `#e7f1eb` / `#d8e4dd` (light green backgrounds)
- **Text Primary**: `#242424` (dark gray)
- **Text Secondary**: `#707070` (medium gray)
- **Text Muted**: `rgba(0,0,0,0.56)` (semi-transparent black)
- **Border**: `rgba(0,0,0,0.12)` (light border)
- **Card Background**: `#f1f3f5` (light gray)

### Typography

- **Title Font**: `Frank Ruhl Libre` (Bold)
  - H1: 32px, line-height: 40px
  - H2: 24px, line-height: 32px
- **Body Font**: `Lato` (Regular/Bold)
  - Base: 16px, line-height: 24px
  - Small: 14px, line-height: 20px
  - Bold: font-weight: 700

### Spacing System

- **Small**: 4px
- **Medium**: 8px, 12px, 16px
- **Large**: 24px, 32px
- **Extra Large**: 40px, 48px
- **Card Padding**: 20px (px-5)
- **Screen Padding**: 20px (left-5)

### Component Patterns

#### Buttons
- **Primary Button**: Dark green background (`#0f361f`), white text, rounded-lg, h-14 (56px)
- **Secondary Button**: Outlined border (`border-[1.5px] border-[#0f361f]`), green text
- **Edit Button**: Light green background (`bg-[rgba(9,184,82,0.12)]`), green text, small padding
- **Add Button**: Same as Edit button style

#### Cards
- **Standard Card**: White background, border (`border border-black/12`), rounded-lg, padding
- **Info Card**: Light gray background (`bg-[#f1f3f5]`), rounded-lg, with nested white card
- **Person Card**: 76px height, flex layout, photo (40x40px or 48x48px), name + relationship

#### Form Inputs
- **Text Input**: Border, rounded-md, padding, focus states
- **Dropdown**: Similar to text input
- **Date Picker**: Custom calendar component
- **Checkbox/Radio**: Radix UI components

#### Lists
- **Person List**: Cards with photos, names, edit buttons
- **Asset List**: Category cards with icons, descriptions, toggle switches
- **Vertical spacing**: 16px-24px between items

#### Modals/Sheets
- **Bottom Sheet**: White background, rounded top corners, drag handle
- **Modal**: Dark overlay (50% opacity), centered or bottom sheet
- **Full Screen Modal**: White background, back button, title

## Navigation Flow

### Main Flow
1. Splash → Welcome → Onboarding (Name → DOB → Spouse → Children → Minors → Assets → Video → Religion)
2. Dashboard → Family & Inheritance
3. Family → Add Members → Distribution Scenarios → Inheritance Summary → Heirs
4. Heirs → Assign Executor → Add Witnesses → Add Signature → Video Consent
5. Will Ready → Preview → Assets Overview
6. Assets → Category Selection → Details Forms → Summary

### Conditional Navigation
- If has children → Ask about minors
- If has minors → Show guardian recommendation
- If spouse exists → Show distribution scenario 1
- If children exist → Show distribution scenario 2
- If both witnesses added → Enable continue

## State Management Patterns (UI Only)

### Local State
- Form field values (name, email, etc.)
- Selection state (selected items, active tabs)
- UI state (loading, errors, expanded/collapsed)
- Modal visibility (show/hide)

### Props Flow
- Parent passes data down
- Callbacks for actions (onSave, onContinue, onBack)
- Conditional rendering based on props

## Key UI Interactions

### Animations
- Splash sequence: Logo scale, text fade-in, progress bar animation
- Modal transitions: Slide up from bottom
- Button press: Visual feedback

### Gestures
- Swipe: Bottom sheet drag handle
- Tap: Buttons, cards, list items
- Long press: (Not observed in screens)

### Feedback
- Loading states: Spinner (not explicitly shown, but implied)
- Error states: Validation messages
- Success states: Green checkmarks, success screens
- Empty states: Placeholder cards with "Add" buttons

## Screen-Specific Patterns

### Dashboard (`WillMilestonesDashboard.tsx`)
- **Layout**: Vertical list of 4 milestone steps
- **Step Structure**: Icon (40x40px) + Title + Description + Status
- **Visual Elements**: 
  - Checkmark icon for completed steps
  - Number badge for incomplete steps
  - Vertical line connecting steps
  - Divider lines between steps
- **Bottom Section**: Dark green bar with "Next step" info and "Get Started" button

### Family Screen (`FamilyInheritance.tsx`)
- **Layout**: Vertical stack of relationship cards
- **Card Types**:
  - Empty card: Placeholder with "Add" button
  - Filled card: Photo + Name + Relationship + "Edit" button
- **Special Cards**: Mother and Others have explanatory text below
- **Continue Button**: Bottom fixed, disabled until at least one member added

### Inheritance Scenarios (`DistributionScenario1.tsx`, `DistributionScenario2.tsx`)
- **Layout**: Spouse/Children cards with percentage sliders
- **Interaction**: Drag sliders to allocate percentages
- **Validation**: Total must equal 100%
- **Visual**: Progress indicators, percentage displays

### Witness Screen (`AddWitnessScreen.tsx`)
- **Layout**: Two witness slots (W1, W2)
- **States**: Empty (button) vs Filled (card with edit)
- **Progress Bar**: Top area showing step progress
- **Continue**: Disabled until both witnesses added

### Assets Overview (`AssetsOverview.tsx`)
- **Layout**: Top section (light green) + Scrollable bottom sheet
- **Top Section**: Title, description, 3 benefit cards
- **Bottom Sheet**: List of asset categories with toggle switches
- **Categories**: Icon placeholder + Title + Description + Toggle/Add button

## Reusable Component Patterns

### Person Card Component
```tsx
<div className="h-[76px] border border-black/12 rounded-lg flex items-center px-5">
  <div className="w-10 h-10 rounded-lg"> {/* Photo */}
  <div className="ml-3 flex-1">
    <p className="font-bold text-base">{name}</p>
    <p className="text-sm text-gray">{relationship}</p>
  </div>
  <button className="bg-green/12 px-2 py-0.5 rounded">
    <span className="text-sm text-green">Edit</span>
  </button>
</div>
```

### Section Title Pattern
```tsx
<h2 className="left-5 top-[88px] font-['Frank_Ruhl_Libre'] font-bold text-2xl text-[#242424]">
  {title}
</h2>
<p className="left-5 top-32 w-[312px] font-['Lato'] text-sm text-[#707070]">
  {description}
</p>
```

### Primary Action Button
```tsx
<button className="left-5 top-[644px] w-80 h-14 bg-[#0f361f] rounded-lg">
  <span className="font-['Frank_Ruhl_Libre'] font-bold text-base text-white">
    {label}
  </span>
</button>
```

## Flutter Conversion Notes

### Screen Dimensions
- **Container**: 360px width (max-w-[360px])
- **Height**: 720px (h-[720px])
- **Mobile-first**: All screens designed for mobile viewport

### Positioning
- **Absolute Positioning**: Most elements use absolute positioning with specific top/left values
- **Flutter Equivalent**: Use `Positioned` widgets or `Stack` with `Align`/`Positioned`

### Responsive Considerations
- Fixed width (360px) suggests mobile-only design
- No breakpoints observed (single breakpoint design)
- Flutter should maintain similar fixed-width container

### Font Loading
- Custom fonts: `Frank Ruhl Libre`, `Lato`
- Flutter: Need to add these fonts to `pubspec.yaml` and use `TextStyle` with `fontFamily`

### Image Assets
- Uses Figma-generated image paths
- Flutter: Convert to asset images or network images

### SVG Usage
- Many decorative elements use SVG
- Flutter: Use `flutter_svg` package or convert to Flutter `CustomPaint`
