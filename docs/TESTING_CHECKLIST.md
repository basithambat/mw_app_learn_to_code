# 🧪 Testing Checklist

## Backend Integration Testing

### Prerequisites ✅
- [ ] Database (PostgreSQL) running
- [ ] Redis running  
- [ ] Backend server running on port 3000
- [ ] Flutter app installed on device

### Step 1: Basic Info (Onboarding) ✅
- [ ] Enter name
- [ ] Select date of birth
- [ ] Select gender
- [ ] Add spouse details
- [ ] Add children
- [ ] Add minors (if applicable)
- [ ] Complete onboarding
- [ ] Verify dashboard shows Step 1 as completed
- [ ] Verify data saved to backend

### Step 2: Family & Inheritance ✅
- [ ] View family members list
- [ ] Add/edit spouse
- [ ] Add/edit children
- [ ] Add/edit mother
- [ ] Add others (optional)
- [ ] Navigate to inheritance distribution
- [ ] Set spouse inheritance percentage
- [ ] Set children inheritance
- [ ] Set no survivors scenario
- [ ] Complete inheritance setup
- [ ] Verify dashboard shows Step 2 as completed
- [ ] Verify data saved to backend

### Step 3: Will Arrangements ✅
- [ ] Assign executor
- [ ] Add executor details
- [ ] Add witnesses (2 required)
- [ ] Capture signature (photo or digital)
- [ ] Record consent video
- [ ] Preview will
- [ ] Complete arrangements
- [ ] Verify dashboard shows Step 3 as completed
- [ ] Verify data saved to backend

### Step 4: Accounts & Properties ✅
- [ ] View properties & accounts screen
- [ ] Add real estate
- [ ] Add vehicles
- [ ] Add gadgets
- [ ] Add jewellery
- [ ] Add investments
- [ ] Add liabilities
- [ ] Add personal business
- [ ] Add household items
- [ ] Assign beneficiaries for each asset
- [ ] Complete assets setup
- [ ] Verify dashboard shows Step 4 as completed
- [ ] Verify data saved to backend

## Edit Flow Testing

- [ ] Edit Step 1 (Basic Info)
- [ ] Verify changes saved
- [ ] Edit Step 2 (Family)
- [ ] Verify changes saved
- [ ] Edit Step 3 (Arrangements)
- [ ] Verify changes saved
- [ ] Edit Step 4 (Assets)
- [ ] Verify changes saved

## Error Handling Testing

- [ ] Test with backend offline (demo mode)
- [ ] Test with invalid credentials
- [ ] Test with network timeout
- [ ] Test with 401 Unauthorized
- [ ] Test with 500 Server Error
- [ ] Verify error messages are user-friendly

## Navigation Testing

- [ ] Back button works on all screens
- [ ] Navigation between steps works
- [ ] Dashboard updates after step completion
- [ ] Edit buttons appear when step is completed
- [ ] Progress bar updates correctly

## Form Validation Testing

- [ ] Required fields show errors
- [ ] Date pickers work correctly
- [ ] Phone number validation
- [ ] Email validation (where applicable)
- [ ] Number inputs validate correctly

## Responsive Design Testing

- [ ] Test on small screen (iPhone SE)
- [ ] Test on medium screen (iPhone 12)
- [ ] Test on large screen (iPhone 14 Pro Max)
- [ ] Verify all screens use full width
- [ ] Verify no horizontal scrolling
- [ ] Verify buttons are accessible

## Performance Testing

- [ ] App starts quickly
- [ ] Screens load without lag
- [ ] Images load efficiently
- [ ] API calls don't block UI
- [ ] Smooth scrolling
- [ ] No memory leaks

## Authentication Testing

- [ ] Mock login works on app startup
- [ ] Token is stored correctly
- [ ] Token is attached to API calls
- [ ] 401 errors handled gracefully
- [ ] Logout works (if implemented)

## Data Persistence Testing

- [ ] Data persists after app restart
- [ ] Data syncs with backend
- [ ] Demo mode data works offline
- [ ] No data loss on navigation

## Edge Cases

- [ ] Empty states display correctly
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] No family members scenario
- [ ] No assets scenario
- [ ] Maximum items (if applicable)
