# React Project Specification for Flutter Conversion

## Project Setup

### Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (recommended) or Create React App
- **State Management**: React Context API or Zustand (simple, no Redux complexity)
- **Routing**: React Router v6
- **HTTP Client**: Axios or Fetch API
- **Form Handling**: React Hook Form
- **UI Library**: Material-UI (MUI) or Tailwind CSS (preferred for easier conversion)
- **Styling**: CSS Modules or Tailwind CSS (avoid styled-components for easier conversion)

### Project Structure
```
react-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Buttons, Cards, Inputs, etc.
│   │   └── layout/          # Header, Footer, Navigation
│   ├── screens/             # Full page screens (one per route)
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── dashboard/
│   │   ├── will-steps/
│   │   ├── assets/
│   │   └── legal-assistant/
│   ├── services/            # API service functions
│   │   ├── api.ts           # Axios instance setup
│   │   ├── auth.service.ts
│   │   ├── will.service.ts
│   │   ├── people.service.ts
│   │   ├── assets.service.ts
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── context/              # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── WillContext.tsx
│   ├── types/               # TypeScript interfaces/types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   ├── constants/           # Constants and enums
│   └── App.tsx
├── public/
└── package.json
```

## Required Screens (Match Flutter Routes)

### 1. Splash Screen (`/`)
- Animated logo transition (3 states)
- Already implemented in Flutter, but provide React version for reference

### 2. Login Screen (`/login`)
- Phone number input
- OTP input field
- "Send OTP" button
- "Verify OTP" button
- Google/Facebook OAuth buttons (optional for MVP)
- Loading states
- Error messages

### 3. Dashboard Screen (`/dashboard`)
- Milestone stepper showing 4 steps:
  1. Basic Info
  2. Family & Inheritance
  3. Will Arrangements
  4. Accounts & Properties
- Status indicators: Not Started / In Progress / Completed
- "Edit" buttons for each step
- Floating "AI Assistant" button (bottom-right)
- List of existing wills (if any)

### 4. Basic Info Screen (`/wills/:willId/basic-info`)
- Form fields:
  - Full Name (text input)
  - Gender (radio/select: Male, Female, Other)
  - Date of Birth (date picker)
  - Marital Status (select dropdown)
  - Spouse Details (conditional, if married)
  - Children Details (array of children with add/remove)
  - Asset Categories (multi-select checkboxes)
- Save button (auto-save on blur/change)
- Next button (navigates to Family step)
- Back button

### 5. Family Screen (`/wills/:willId/family`)
- List of family members (spouse, children, parents, others)
- "Add Person" button/form
- Person card showing:
  - Name, relationship, DOB
  - Edit/Delete buttons
- Guardian assignment section (for minors)
- "Assign Guardian" button/modal
- Next button (navigates to Inheritance)
- Back button

### 6. Inheritance Screen (`/wills/:willId/inheritance`)
- Three scenario tabs/sections:
  1. "If I die before my spouse"
  2. "If my spouse dies before me"
  3. "If no one survives"
- For each scenario:
  - Allocation form (person + percentage)
  - Add/remove allocations
  - Total must equal 100% (validation)
  - Warning if Muslim and >1/3 to non-heirs
- Next button (navigates to Arrangements)
- Back button

### 7. Arrangements Screen (`/wills/:willId/arrangements`)
- Executor section:
  - Select executor from people list
  - Executor details display
- Witnesses section:
  - List of witnesses (min 2 required)
  - "Add Witness" form
  - Witness eligibility validation
- Signature section:
  - Upload signature image
  - Or draw signature (canvas)
- Consent Video section (optional):
  - Record/upload video
- Declaration checkbox:
  - "I am of sound mind..." checkbox
- "Generate Will PDF" button
- Back button

### 8. Assets Screen (`/wills/:willId/assets`)
- Asset categories tabs/filters
- List of assets (cards)
- "Add Asset" button/form
- Asset card showing:
  - Title, category, ownership type
  - Estimated value
  - Beneficiaries
  - Edit/Delete buttons
- Asset form fields:
  - Category (select)
  - Title (text)
  - Description (textarea)
  - Ownership Type (select: Self-acquired, Joint, Ancestral, HUF, etc.)
  - Ownership Share % (number, if joint/ancestral)
  - Estimated Value (number range)
  - Transfer To (multi-select from people)

### 9. Assistant Screen (`/assistant?willId=xxx`)
- Chat interface
- Message list (user messages + assistant responses)
- Input field at bottom
- "Escalate to Human" button
- Context-aware (shows will info if willId provided)

## Component Requirements

### Common Components Needed

1. **PrimaryButton**
   - Props: `label`, `onPress`, `disabled`, `loading`
   - Styled button matching Flutter theme

2. **SecondaryButton** / **OutlinedButton**
   - Similar to PrimaryButton but outlined style

3. **TextInput**
   - Props: `label`, `value`, `onChange`, `error`, `helperText`, `type`
   - Error state styling

4. **Select/Dropdown**
   - Props: `label`, `options`, `value`, `onChange`, `error`

5. **Card**
   - Props: `children`, `onClick` (optional)
   - Shadow and border styling

6. **ProgressStepper**
   - Props: `steps` (array), `currentStep`, `onStepClick`
   - Shows step status (not started, in progress, completed)

7. **FloatingActionButton**
   - Props: `icon`, `label`, `onPress`
   - Fixed position bottom-right

8. **BottomSheet/Modal**
   - Props: `open`, `onClose`, `children`
   - Slide up animation

9. **LoadingSpinner**
   - Full screen or inline

10. **ErrorMessage**
    - Props: `message`, `onRetry` (optional)

## API Integration

### Service Functions Structure
Each service should have functions matching the Flutter services:

```typescript
// Example: will.service.ts
export const willService = {
  createWill: async (data: CreateWillDto) => Promise<Will>,
  getWill: async (willId: string) => Promise<Will>,
  updateWill: async (willId: string, data: UpdateWillDto) => Promise<Will>,
  updateBasicInfo: async (willId: string, data: BasicInfoDto) => Promise<Will>,
};
```

### API Client Setup
```typescript
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Error Handling
- Use try-catch in all service functions
- Return error objects: `{ success: false, error: string }`
- Handle 401 (unauthorized) - redirect to login
- Handle 400/500 - show error messages

## State Management

### Context Providers Needed

1. **AuthContext**
   - `user`: User object
   - `isAuthenticated`: boolean
   - `login(phone, otp)`: function
   - `logout()`: function
   - `sendOtp(phone)`: function

2. **WillContext** (optional, can use local state)
   - `currentWill`: Will object
   - `updateWill()`: function
   - `refreshWill()`: function

## Form Handling

### Use React Hook Form
```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();
```

### Validation Rules
- Use `yup` or `zod` for schema validation
- Match backend validation rules
- Show inline error messages

## Styling Guidelines

### Color Palette (Match Flutter Theme)
```css
--primary-color: #2563EB;      /* Trust Blue */
--secondary-color: #1D4ED8;    /* Darker Blue */
--accent-color: #F59E0B;       /* Warm Amber */
--success-color: #10B981;       /* Green */
--error-color: #EF4444;        /* Red */
--background: #F9FAFB;          /* Light Gray */
--surface: #FFFFFF;             /* White */
--text-primary: #1F2937;        /* Dark Gray */
--text-secondary: #6B7280;      /* Medium Gray */
```

### Typography
- Font family: Inter (or system font stack)
- Font sizes: Match Flutter textTheme
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- Use consistent spacing scale: 4px, 8px, 16px, 24px, 32px, 48px
- Match Flutter AppTheme spacing

### Border Radius
- Small: 4px
- Medium: 8px
- Large: 12px
- XLarge: 16px

## Data Types/Interfaces

### Define TypeScript interfaces matching backend DTOs:

```typescript
// types/index.ts

export interface User {
  id: string;
  phone?: string;
  email?: string;
  fullName?: string;
}

export interface Will {
  id: string;
  userId: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'GENERATED';
  personalLaw: 'HINDU' | 'MUSLIM' | 'CHRISTIAN' | 'UNKNOWN';
  profile?: WillProfile;
  people?: WillPerson[];
  scenarios?: InheritanceScenario[];
  // ... other fields
}

export interface WillPerson {
  id: string;
  fullName: string;
  relationship: 'SPOUSE' | 'CHILD' | 'MOTHER' | 'FATHER' | 'SIBLING' | 'OTHER';
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  isMinor: boolean;
  email?: string;
  phone?: string;
}

export interface InheritanceScenario {
  id: string;
  type: 'USER_DIES_FIRST' | 'SPOUSE_DIES_FIRST' | 'NO_ONE_SURVIVES';
  allocations: Array<{
    personId: string;
    percentage: number;
    description?: string;
  }>;
}

export interface Asset {
  id: string;
  category: 'REAL_ESTATE' | 'VEHICLES' | 'GADGETS' | 'JEWELLERY' | 'INVESTMENTS' | 'LIABILITIES' | 'OTHERS';
  title: string;
  description?: string;
  ownershipType: 'SELF_ACQUIRED' | 'JOINT' | 'ANCESTRAL' | 'HUF' | 'INHERITED';
  ownershipShare?: number;
  estimatedValue?: { min: number; max: number; currency: string };
  transferToPersonIds: string[];
}
```

## Key Features to Implement

### 1. Auto-save Functionality
- Save form data on blur/change
- Show "Saving..." indicator
- Show "Saved" confirmation

### 2. Loading States
- Show loading spinner during API calls
- Disable buttons during submission
- Skeleton loaders for data fetching

### 3. Error Handling
- Global error boundary
- Inline form errors
- Toast notifications for API errors
- Retry mechanisms

### 4. Validation
- Client-side validation before API calls
- Real-time validation feedback
- Match backend validation rules

### 5. Navigation
- Protected routes (require auth)
- Deep linking support
- Back button handling
- Step navigation (prev/next)

## Code Style Requirements

### Naming Conventions
- Components: PascalCase (`BasicInfoScreen.tsx`)
- Functions: camelCase (`createWill`, `updateBasicInfo`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Files: Match component name

### Code Organization
- One component per file
- Export default for main component
- Named exports for utilities
- Keep components small and focused
- Extract reusable logic to hooks

### Comments
- Add JSDoc comments for complex functions
- Comment business logic (inheritance rules, validation)
- Mark TODO items for future enhancements

## Testing Considerations

### Provide Test Data
- Mock API responses
- Sample will data
- Test user credentials
- Edge cases (empty states, errors)

## Deliverables

### What to Provide
1. **Complete React codebase** with all screens
2. **Component library** (reusable components)
3. **API service layer** (all endpoints integrated)
4. **Type definitions** (TypeScript interfaces)
5. **README.md** with:
   - Setup instructions
   - API endpoint documentation
   - Component usage examples
   - Known issues/limitations

### File Organization
- Well-organized folder structure
- Clear separation of concerns
- Consistent naming patterns
- No circular dependencies

## Conversion Notes for AI

### What Makes Conversion Easier
1. **Simple state management** (Context API, not Redux)
2. **Functional components** (not class components)
3. **Hooks-based** (useState, useEffect, useContext)
4. **Tailwind CSS** (easier to convert than styled-components)
5. **Clear component boundaries**
6. **TypeScript** (type safety helps conversion)
7. **Consistent naming** (matches Flutter patterns)

### What to Avoid
- Complex state management libraries (Redux, MobX)
- Styled-components (harder to convert)
- Class components
- Heavy dependencies
- Inline styles (use CSS modules or Tailwind)

## Priority Order

### Phase 1 (Must Have)
1. Login Screen
2. Dashboard Screen
3. Basic Info Screen
4. Family Screen
5. Inheritance Screen
6. Arrangements Screen

### Phase 2 (Nice to Have)
1. Assets Screen
2. Assistant Screen
3. Will Preview/PDF Viewer

## Additional Notes

- **Match Flutter UI exactly** - Use the same colors, spacing, typography
- **Keep it simple** - Don't over-engineer, focus on functionality
- **Mobile-first** - Design for mobile, responsive for web
- **Accessibility** - Add proper ARIA labels, keyboard navigation
- **Performance** - Lazy load routes, optimize images
- **Error boundaries** - Catch and display errors gracefully

---

## Quick Checklist for Coding Agent

- [ ] React 18+ with TypeScript
- [ ] Vite or CRA setup
- [ ] React Router v6 configured
- [ ] Axios for API calls
- [ ] React Hook Form for forms
- [ ] Tailwind CSS or Material-UI
- [ ] All 9 screens implemented
- [ ] API services for all endpoints
- [ ] Auth context/provider
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation
- [ ] TypeScript types/interfaces
- [ ] Responsive design
- [ ] Clean code structure
- [ ] README with setup instructions
