# Family & Inheritance Flow Implementation Status

## ✅ Implemented

### 1. Add Spouse Screen (`add_spouse_screen.dart`)
- ✅ Full name input field with green border when active
- ✅ Date of birth picker with formatted display (dd / MM / yyyy)
- ✅ Relationship selector (Husband/Wife) with radio buttons
- ✅ Photo upload button (placeholder - needs image picker integration)
- ✅ Save button with enabled/disabled states
- ✅ Navigation from Family Screen

### 2. Add Child Screen (`add_child_screen.dart`)
- ✅ Full name input field with green border when active
- ✅ Date of birth picker with formatted display
- ✅ Relationship selector (Son/Daughter) with radio buttons
- ✅ Photo upload button (placeholder)
- ✅ Child number indicator in header
- ✅ Save button with enabled/disabled states
- ✅ Navigation from Family Screen

### 3. Children Count Modal
- ✅ Modal bottom sheet with "How many children you have?" title
- ✅ Number picker (1-6) with selection highlighting
- ✅ Description text about including stepchildren/adopted
- ✅ Continue button that triggers child addition flow
- ✅ Integrated into Family Screen

### 4. Family Screen Updates
- ✅ Navigation to Add Spouse screen
- ✅ Navigation to Edit Spouse screen
- ✅ Navigation to Add Children (triggers count modal)
- ✅ Navigation to Edit Children (triggers count modal)
- ✅ Reload people after adding/editing

## ❌ Missing / TODO

### 1. Add Guardian Screen
- ❌ Full name, Date of birth, Relationship fields
- ❌ Children selection checkboxes (who they'll be guardian for)
- ❌ Photo upload
- ❌ Save functionality

### 2. Guardian Prompt Modal
- ❌ Modal that appears when children under 18 are added
- ❌ Image showing guardian with children
- ❌ "Add Guardian" button
- ❌ "Skip for now" link
- ❌ Logic to detect under-18 children and trigger modal

### 3. "Understand what is counted" Modal
- ❌ Modal with title "Understand what is counted for distribution here"
- ❌ INCLUDED section with bullet points:
  - Property (Flat, House, Land)
  - Money in your bank accounts
  - Stocks, jewellery & shares
  - Things that can be distributed
- ❌ NOT INCLUDED section with bullet points:
  - Nominated life insurance policies
  - Asset that can have singular ownership like vehicle or gadget*
- ❌ Footnote about adding assets
- ❌ "Okay, Continue" button
- ❌ Link from Family Screen footer

### 4. Inheritance Distribution - Spouse Screen
- ❌ Header: "If you die before your spouse, how much should she get?"
- ❌ Description text
- ❌ Spouse profile picture
- ❌ Percentage display (100%)
- ❌ Horizontal slider (70, 80, 90, 100)
- ❌ "Next" button
- ❌ Progress bar in header

### 5. Inheritance Distribution - Children Screen
- ❌ Header: "If your spouse dies before you, how much your child gets?"
- ❌ Description text
- ❌ Multiple child entries with:
  - Profile picture
  - Name
  - Percentage display
  - Individual slider for each child
- ❌ Validation that percentages add up to 100%
- ❌ "Next" button

### 6. Inheritance Distribution - No Survivors Screen
- ❌ Header: "If no one survives from your family, who gets your estate?"
- ❌ Description text
- ❌ Mother/other beneficiary card with:
  - Profile picture
  - Name
  - "gets 100%" text
- ❌ "Add another" button (for charity/friend)
- ❌ "Save" button

### 7. Inheritance Summary Screen
- ❌ Header: "Inheritance summary"
- ❌ Three sections:
  - "IF YOU DIE BEFORE YOUR SPOUSE" with spouse name and percentage
  - "IF YOUR SPOUSE DIES BEFORE YOU" with children names and percentages
  - "IF NO ONE FROM YOUR FAMILY IS LIVING" with beneficiary name and percentage
- ❌ Edit buttons for each section
- ❌ "Save & Exit" button

### 8. Inheritance Screen Updates
- ❌ Replace list view with navigation to distribution screens
- ❌ Flow: Spouse → Children → No Survivors → Summary
- ❌ Save scenarios to backend
- ❌ Load existing scenarios

### 9. Additional Features
- ❌ Photo picker integration (image_picker package)
- ❌ Date picker matching design (wheel picker like onboarding)
- ❌ Children display with combined names (e.g., "Avi & Gouri Sharma")
- ❌ Group profile pictures for multiple children
- ❌ Under-18 detection logic
- ❌ Guardian assignment to specific children

## Design Patterns to Follow

1. **Input Fields**: Green border (2px) when active/filled, gray border (1px) when inactive
2. **Radio Buttons**: Circular with green fill when selected
3. **Modals**: Bottom sheet with rounded top corners, white background
4. **Sliders**: Horizontal with tick marks, green accent color
5. **Profile Pictures**: Circular, 40px for cards, 80px for forms
6. **Typography**: Frank Ruhl Libre for titles, Lato for body text
7. **Colors**: Dark green (#0D361E) for primary, light green for accents

## Next Steps

1. Create Add Guardian Screen
2. Create Guardian Prompt Modal
3. Create "Understand what is counted" Modal
4. Create three Inheritance Distribution screens
5. Create Inheritance Summary Screen
6. Update Inheritance Screen to use new flow
7. Integrate photo picker
8. Add under-18 detection and guardian prompts
