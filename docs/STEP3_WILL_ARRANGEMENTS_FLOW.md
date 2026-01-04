# Step 3: Will Arrangements Flow - Complete Analysis

## Overview
Step 3 involves assigning executors, adding witnesses, adding signature, and recording consent video. This is a multi-step process that must be completed in sequence.

## Complete Flow Breakdown

### Phase 1: Assign Executor

#### Screen 1: Assign Executor (Initial)
**Purpose:** Display existing executors and allow adding new ones

**Elements:**
- Title: "Assign an executor"
- Description text explaining executor role
- List of existing executors with:
  - Profile picture (circular)
  - Name
  - "Edit" button (light green)
- "Add new executor" button (green)
- "Continue" button at bottom (grayed out until at least one executor is added)

**Actions:**
- Tap executor → Edit executor
- Tap "Add new executor" → Navigate to Add Executor screen
- Tap "Continue" → Proceed to next phase (only enabled when executor exists)

#### Screen 2: Duties of Executor Modal (Pop-up)
**Purpose:** Inform user about executor duties

**Elements:**
- Modal overlay on Assign Executor screen
- Title: "Duties of an executor"
- List of duties with green checkmarks:
  1. Duty 1
  2. Duty 2
  3. Duty 3
  4. Duty 4
- "Got it" button (green) at bottom

**Actions:**
- Tap "Got it" → Close modal, return to Assign Executor screen

#### Screen 3: Add Executor
**Purpose:** Form to add a new executor

**Elements:**
- Title: "Add an executor"
- Input fields:
  - Full name (text field with green border when active)
  - Email address (text field)
  - Mobile number (text field)
  - Relationship (dropdown)
- "Add" button (green) at bottom
- Keyboard visible when input is active

**Actions:**
- Fill form → Tap "Add" → Save executor and return to Assign Executor screen

#### Screen 4: Assign Executor (Updated)
**Purpose:** Show all executors after adding new one

**Elements:**
- Same as Screen 1, but with new executor added to list
- "Continue" button now green (enabled)

**Actions:**
- Tap "Continue" → Proceed to Add Witness phase

---

### Phase 2: Add Witnesses

#### Screen 5: Add Witness (Initial)
**Purpose:** Explain witness requirement and allow adding witnesses

**Elements:**
- Title: "Add witness"
- Description text explaining witness requirement (need 2 witnesses)
- Two buttons:
  - "Add first witness" (green)
  - "Add second witness" (grayed out)
- "Continue" button at bottom (grayed out)

**Actions:**
- Tap "Add first witness" → Navigate to Add Witness 1 screen
- "Add second witness" disabled until first witness is added

#### Screen 6: Add Witness 1
**Purpose:** Form to add first witness

**Elements:**
- Title: "Add witness 1"
- Input fields:
  - Full name (text field)
  - Email address (text field)
  - Mobile number (text field)
  - Relationship (dropdown)
- "Add" button (green) at bottom
- Keyboard visible

**Actions:**
- Fill form → Tap "Add" → Save witness and return to Add Witness screen

#### Screen 7: Add Witness (One Witness Added)
**Purpose:** Show first witness added, allow adding second

**Elements:**
- Title: "Add witness"
- Witness 1 listed with:
  - Name (e.g., "Amelia Sara")
  - "Edit" button (light green)
- "Add second witness" button (green, now enabled)
- "Save & Continue" button at bottom (green, enabled)

**Actions:**
- Tap "Edit" on Witness 1 → Edit witness
- Tap "Add second witness" → Navigate to Add Witness 2 screen
- Tap "Save & Continue" → Proceed to Signature phase (if 2 witnesses added)

#### Screen 8: Add Witness (Two Witnesses Added)
**Purpose:** Show both witnesses added

**Elements:**
- Title: "Add witness"
- Witness 1 listed with "Edit" button
- Witness 2 listed with "Edit" button (e.g., "Rishabh Gupta")
- "Save & Continue" button at bottom (green, enabled)

**Actions:**
- Tap "Edit" on any witness → Edit witness
- Tap "Save & Continue" → Proceed to Signature phase

---

### Phase 3: Add Signature

#### Screen 9: Add Signature
**Purpose:** Choose signature method

**Elements:**
- Title: "Add your signature"
- Large image showing hands signing document with pen
- Description text explaining importance of signature
- Two buttons:
  - "Take a photo of my signature" (green, primary)
  - "Add my digital signature" (white, secondary)

**Actions:**
- Tap "Take a photo of my signature" → Open camera to capture signature photo
- Tap "Add my digital signature" → Navigate to Digital Signature Canvas

#### Screen 10: Digital Signature Canvas (Blank)
**Purpose:** Draw digital signature

**Elements:**
- Title: "Sign your signature on the dotted line"
- Large white canvas with faint dotted line
- Two buttons at bottom:
  - "Undo" (gray, left)
  - "Done" (green, right)

**Actions:**
- Draw signature on canvas with finger/stylus
- Tap "Undo" → Clear last stroke
- Tap "Done" → Save signature and proceed

#### Screen 11: Digital Signature Canvas (Signed)
**Purpose:** Show completed signature

**Elements:**
- Same as Screen 10, but signature is drawn (e.g., "Rishabh" in black script)
- "Done" button (green, enabled)

**Actions:**
- Tap "Done" → Save signature and proceed to Consent phase

---

### Phase 4: Record Consent Video

#### Screen 12: Record Consent Screen
**Purpose:** Explain video consent requirement

**Elements:**
- Title: "Your will is ready, record a consent to finish it"
- Large image of person smiling, looking at smartphone
- Description text explaining need for video consent
- "Record consent" button (green) at bottom

**Actions:**
- Tap "Record consent" → Navigate to Video Recording screen

#### Screen 13: Video Recording Screen
**Purpose:** Record consent video

**Elements:**
- Video preview/camera view showing person (e.g., Rishabh Sharma)
- Text overlay at bottom showing consent script:
  "I am [Name], and I declare that all the things mentioned are below my knowledge and I am distributing my assets in whole senses, without anyone's force. This shall be considered as my last will."
- "Swipe to record" button (green) at bottom

**Actions:**
- Tap and hold "Swipe to record" → Start recording
- Release → Stop recording
- After recording → Proceed to Will Ready screen

---

### Phase 5: Will Ready & Preview

#### Screen 14: Will Ready Confirmation
**Purpose:** Confirm will is ready and show next steps

**Elements:**
- Title: "Yay! Your will is ready"
- Small preview of will document at top
- "Review my will" button (green)
- "Next steps" section with checklist:
  - "Notify your executors" (grayed out, not checked)
  - "Notify your family & properties" (grayed out, not checked)

**Actions:**
- Tap "Review my will" → Navigate to Will Document Preview

#### Screen 15-18: Will Document Preview
**Purpose:** Show generated will document

**Elements:**
- Scrollable document preview
- Cover page with:
  - Dark green header
  - "[Name]'s Last Will & Testament"
  - "Date of effect: [Date]"
  - Logo at bottom
- Document content (scrollable)
- Bottom section with tips:
  - "Make your will more strong with your assets"
  - "Notify your executors"
  - "Notify your family & properties"
  - "Add more assets"
  - "View all assets" link

**Actions:**
- Scroll to view full document
- Tap "View all assets" → Navigate to assets screen
- Can navigate back to dashboard

---

## Flow Sequence Summary

1. **Assign Executor**
   - View executors → (Optional) View duties modal → Add executor → Continue

2. **Add Witnesses**
   - View witness requirement → Add first witness → Add second witness → Save & Continue

3. **Add Signature**
   - Choose method (photo or digital) → Capture/Draw signature → Done

4. **Record Consent**
   - View consent explanation → Record video → Complete

5. **Will Ready**
   - View confirmation → Review will → Complete step 3

## Key Requirements

### Executor
- At least 1 executor required
- Can add multiple executors
- Executor cannot be a beneficiary (validation)
- Executor cannot be a witness (validation)

### Witnesses
- Exactly 2 witnesses required
- Witnesses must be adults
- Witnesses should not be beneficiaries (validation)
- Witnesses should not be executors (validation)

### Signature
- Either photo signature OR digital signature (not both)
- Digital signature drawn on canvas
- Photo signature captured from camera

### Consent Video
- Video recording required
- Must include consent statement
- Video file uploaded to backend

## Validation Rules

1. **Executor Validation:**
   - Cannot be a beneficiary
   - Must be 18+ years old
   - Must have valid contact info

2. **Witness Validation:**
   - Cannot be a beneficiary
   - Cannot be an executor
   - Must be 18+ years old
   - Must have valid contact info
   - Exactly 2 witnesses required

3. **Step Completion:**
   - At least 1 executor assigned
   - Exactly 2 witnesses added
   - Signature uploaded (photo or digital)
   - Consent video recorded
   - All above → Step 3 marked as COMPLETED

## API Endpoints Required

- `POST /wills/:willId/executor` - Assign executor
- `GET /wills/:willId/executor` - Get executors
- `POST /wills/:willId/witnesses` - Add witness
- `GET /wills/:willId/witnesses` - Get witnesses
- `POST /wills/:willId/signature` - Upload signature (photo or digital)
- `POST /wills/:willId/consent-video` - Upload consent video
- `GET /wills/:willId/preview` - Get will preview/document

## Implementation Status

### ✅ Existing
- Basic ArrangementsScreen structure
- ArrangementsService with API methods
- Backend API endpoints for executor, witnesses, signature, consent video

### ❌ Missing Screens
1. Assign Executor Screen (with executor list)
2. Duties of Executor Modal
3. Add Executor Screen (form)
4. Add Witness Screen (initial with buttons)
5. Add Witness 1/2 Screens (forms)
6. Add Signature Screen (with method selection)
7. Digital Signature Canvas Screen
8. Record Consent Screen
9. Video Recording Screen
10. Will Ready Confirmation Screen
11. Will Document Preview Screen

### ❌ Missing Features
- Image picker for signature photo
- Camera integration for signature photo
- Digital signature drawing canvas
- Video recording functionality
- Will document PDF generation/preview
- Executor selection from existing people
- Witness validation UI feedback

## Next Steps

1. Create Assign Executor Screen
2. Create Add Executor Screen
3. Create Add Witness Screens (initial + forms)
4. Create Add Signature Screen with method selection
5. Create Digital Signature Canvas
6. Create Record Consent & Video Recording screens
7. Create Will Ready & Preview screens
8. Integrate image picker and camera
9. Integrate video recording
10. Add validation and error handling
11. Connect all screens in proper flow sequence
