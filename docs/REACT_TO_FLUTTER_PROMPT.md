# React to Flutter Conversion Prompt Template

Use this prompt with your React coding agent to extract all information needed for Flutter conversion.

---

## Screen-Specific Prompt Template

```
I need to convert a React screen to Flutter. Please provide detailed information about the [SCREEN_NAME] screen:

### 1. Component Structure
- Show me the complete JSX/TSX code for this screen
- List all child components used (with their file paths if possible)
- Show the component hierarchy/tree structure
- Include all props being passed between components

### 2. Styling Details
- Show all CSS/Tailwind classes used in this screen
- Provide exact spacing values (margins, padding, gaps)
- List all colors used (hex codes preferred)
- Typography details (font family, sizes, weights, line heights)
- Border radius values
- Shadow/elevation values
- Any responsive breakpoints or media queries

### 3. State Management
- Show all useState, useEffect, useReducer, or other hooks used
- List all state variables and their types
- Show how state is updated (setState calls, reducers, etc.)
- If using Context/Redux/Zustand, show the state structure and how it's accessed

### 4. Props & Data Flow
- List all props this component receives
- Show the data types/interfaces for props
- Show how data flows from parent to child components
- Show any callbacks or event handlers passed as props

### 5. API Integration
- Show all API calls made in this screen (fetch, axios, etc.)
- List the endpoints used
- Show request/response data structures
- Show loading states and error handling
- Show any data transformations after API calls

### 6. Form Handling (if applicable)
- Show all form fields and their types
- Show validation rules and error messages
- Show form submission logic
- Show any form libraries used (react-hook-form, formik, etc.)

### 7. Navigation
- Show how navigation to this screen happens (route path)
- Show any navigation from this screen to other screens
- Show any route parameters or query strings used
- Show any deep linking or navigation guards

### 8. User Interactions
- List all buttons, inputs, and interactive elements
- Show click handlers and their logic
- Show any animations or transitions
- Show any modals, bottom sheets, or dialogs
- Show any swipe gestures or other interactions

### 9. Business Logic
- Show any calculations or data processing
- Show any conditional rendering logic
- Show any filtering, sorting, or searching logic
- Show any permission checks or authorization logic

### 10. Dependencies
- List all npm packages used in this screen
- Show any custom hooks or utilities imported
- Show any shared components or constants used

### 11. Assets
- List all images, icons, or SVGs used
- Show their file paths or import statements
- Show any fonts or custom typography

### 12. Edge Cases & Error States
- Show empty states (no data)
- Show error states (API failures)
- Show loading states (skeletons, spinners)
- Show any retry logic or error recovery

Please provide the code and explanations in a clear, organized format.
```

---

## Quick Version (For Faster Extraction)

```
For the [SCREEN_NAME] screen, provide:
1. Complete component code (JSX/TSX)
2. All styling (CSS/Tailwind classes with values)
3. All state variables and hooks
4. All API calls and endpoints
5. All props and data types
6. Navigation routes
7. All dependencies/packages used
8. Any animations or transitions
```

---

## Screen List to Convert

Based on the PRD, here are the screens we need:

### Authentication & Onboarding
- [ ] Login Screen (OTP, Google, Facebook)
- [ ] OTP Verification Screen
- [ ] Terms & Privacy Acceptance

### Will Creation Flow
- [ ] Milestone Dashboard (stepper with 4 steps)
- [ ] Basic Info Screen (Step 1)
- [ ] Family & Inheritance Screen (Step 2)
- [ ] Inheritance Distribution Screen (scenarios)
- [ ] Will Arrangements Screen (Step 3)
- [ ] Assets Screen (Step 4 - Optional)

### Supporting Screens
- [ ] Will Preview/PDF Viewer Screen
- [ ] AI Legal Assistant Chat Screen
- [ ] Legal Aid Request Screen
- [ ] Legal Aid Chat/Message Screen

---

## Priority Order (Suggested)

1. **Login Screen** - Entry point, critical for testing
2. **Milestone Dashboard** - Main navigation hub
3. **Basic Info Screen** - First step of will creation
4. **Family & Inheritance Screen** - Core functionality
5. **AI Assistant Screen** - Key feature
6. **Will Arrangements Screen** - Final step before PDF
7. **Assets Screen** - Optional but important
8. **Other screens** - As needed

---

## Additional Questions to Ask

If the React agent provides code but you need more details, ask:

```
For the [SCREEN_NAME] screen, I also need:
- The exact pixel values for spacing (not just Tailwind class names)
- The exact color hex codes (not just color names)
- The exact font sizes in pixels
- Any animation durations or easing functions
- Any API response examples or mock data structures
- Any validation error messages (exact text)
- Any loading state designs or skeleton screens
```

---

## Example Usage

**For Login Screen:**
```
I need to convert the Login Screen to Flutter. Please provide detailed information about the Login Screen:

[Paste the full prompt template above]

Specifically, I need:
- OTP input field implementation
- Google/Facebook OAuth button implementations
- Phone number input validation
- OTP sending and verification flow
- Error handling for invalid OTP
- Loading states during API calls
```

---

## Notes

- Ask for one screen at a time for better focus
- Request actual code, not just descriptions
- Ask for styling values, not just class names
- Request data structures/types, not just examples
- Ask for complete component trees, not just top-level components
