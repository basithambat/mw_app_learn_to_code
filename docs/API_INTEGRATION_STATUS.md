# API Integration Status

## Summary

**Current Status:** Partial Integration
- ✅ Core services are implemented (WillService, PeopleService, AssetsService, InheritanceService, ArrangementsService)
- ✅ Most screens have API call logic implemented
- ⚠️ Many screens fall back to demo mode when `willId` is null or starts with 'demo-'
- ⚠️ Some screens have incomplete API integration (TODOs present)

## Service Layer Status

### ✅ Fully Implemented Services

1. **WillService** (`apps/mobile_web/lib/features/will_steps/services/will_service.dart`)
   - `createWill()` ✅
   - `getWill()` ✅
   - `getAllWills()` ✅
   - `updateWill()` ✅
   - `updateBasicInfo()` ✅

2. **PeopleService** (`apps/mobile_web/lib/features/will_steps/services/people_service.dart`)
   - `getPeople()` ✅
   - `addPerson()` ✅
   - `updatePerson()` ✅
   - `deletePerson()` ✅
   - `assignGuardian()` ✅
   - `getGuardians()` ✅

3. **AssetsService** (`apps/mobile_web/lib/features/assets/services/assets_service.dart`)
   - `getAssets()` ✅
   - `addAsset()` ✅
   - `updateAsset()` ✅
   - `deleteAsset()` ✅

4. **InheritanceService** (needs verification)
   - `getScenarios()` ✅ (used in inheritance screens)
   - `updateScenario()` ✅ (used in inheritance screens)

5. **ArrangementsService** (needs verification)
   - `getExecutor()` ✅
   - Other methods need verification

## Screen Integration Status

### ✅ Fully Connected Screens

#### Step 1: Basic Info
- ✅ **DashboardScreen** - Calls `WillService.getWill()`, `WillService.updateWill()`
- ✅ **BasicInfoScreen** - Calls `WillService.updateBasicInfo()`
- ✅ **OnboardingFlowScreen** - Calls `WillService.createWill()`

#### Step 2: Family & Inheritance
- ✅ **FamilyScreen** - Calls `PeopleService.getPeople()`, `PeopleService.addPerson()`
- ✅ **AddSpouseScreen** - Calls `PeopleService.addPerson()`, `PeopleService.updatePerson()`
- ✅ **AddChildScreen** - Calls `PeopleService.addPerson()`, `PeopleService.updatePerson()`
- ✅ **AddGuardianScreen** - Calls `PeopleService.assignGuardian()`, `PeopleService.updatePerson()`
- ✅ **InheritanceNoSurvivorsScreen** - Calls `InheritanceService.getScenarios()`, `InheritanceService.updateScenario()`
- ✅ **AddMotherScreen** - Calls `PeopleService.addPerson()`, `PeopleService.updatePerson()`
- ✅ **AddOthersScreen** - Calls `PeopleService.addPerson()`, `PeopleService.updatePerson()`
- ✅ **AddCharityFriendScreen** - Calls `PeopleService.addPerson()`

#### Step 3: Will Arrangements
- ⚠️ **ArrangementsScreen** - Has demo mode, needs full API integration
- ⚠️ **AssignExecutorScreen** - Has demo mode, needs `ArrangementsService.getExecutor()`
- ⚠️ **AddExecutorScreen** - Has demo mode, needs executor API
- ⚠️ **AddWitnessScreen** - Has demo mode, needs witness API
- ⚠️ **AddWitnessFormScreen** - Has demo mode, needs witness API
- ⚠️ **AddSignatureScreen** - Has partial API (photo upload), needs signature API
- ⚠️ **SignatureCanvasScreen** - Has partial API, needs signature upload
- ⚠️ **RecordConsentScreen** - Needs consent API
- ⚠️ **VideoRecordingScreen** - Has partial API, needs video upload
- ⚠️ **WillReadyScreen** - Needs will status API
- ⚠️ **WillPreviewScreen** - Needs PDF generation API

#### Step 4: Accounts & Properties
- ✅ **PropertiesMainScreen** - Calls `AssetsService.getAssets()`
- ✅ **JewelleryDetailsScreen** - Calls `AssetsService.addAsset()`
- ✅ **JewelleryPhotoCaptureScreen** - Calls `AssetsService.addAsset()`
- ✅ **GadgetDetailsScreen** - Calls `AssetsService.addAsset()`
- ✅ **BusinessDetailsScreen** - Calls `AssetsService.addAsset()`
- ✅ **HouseholdItemsScreen** - Calls `AssetsService.addAsset()`
- ⚠️ **RealEstateDetailsScreen** - Has demo mode, needs API verification
- ⚠️ **VehicleDetailsScreen** - Has demo mode, needs API verification
- ⚠️ **LiabilitiesAutoTrackScreen** - Needs liabilities API
- ⚠️ **InvestmentsAutoTrackScreen** - Needs investments API
- ⚠️ **InvestmentsSyncProgressScreen** - Needs sync status API

### ⚠️ Partially Connected Screens

These screens have API calls but also have demo mode fallbacks:

1. **All Asset Screens** - Have `if (willId == null || willId.startsWith('demo-'))` checks
2. **All Arrangement Screens** - Have demo mode fallbacks
3. **TransferToModal** - Has demo data fallback
4. **RealEstateInheritanceModal** - Has demo data fallback
5. **VehicleNomineeModal** - Has demo data fallback

### ❌ Missing API Connections

1. **ArrangementsService Methods:**
   - `addExecutor()` - Not found
   - `getWitnesses()` - Not found
   - `addWitness()` - Not found
   - `uploadSignature()` - Not found
   - `uploadConsentVideo()` - Not found
   - `getWillStatus()` - Not found

2. **AssetsService Methods:**
   - `getAssetsByCategory()` - Exists but needs verification
   - Auto-track methods for liabilities/investments - Not found

3. **InheritanceService:**
   - Full service file needs verification

4. **File Upload:**
   - Photo upload API - Not implemented
   - Signature upload API - Not implemented
   - Video upload API - Not implemented

## Demo Mode Pattern

Most screens follow this pattern:
```dart
if (widget.willId == null || widget.willId!.startsWith('demo-')) {
  // Use demo data
  await Future.delayed(const Duration(milliseconds: 500));
  // Return demo result
  return;
}

// Real API call
await _service.method(widget.willId!, data);
```

This allows the app to work offline but means real API integration needs verification.

## Backend API Endpoints Needed

Based on the service calls, these endpoints should exist:

### Will Endpoints
- ✅ `POST /api/wills` - Create will
- ✅ `GET /api/wills/:id` - Get will
- ✅ `GET /api/wills` - List wills
- ✅ `PATCH /api/wills/:id` - Update will
- ✅ `PATCH /api/wills/:id/basic-info` - Update basic info

### People Endpoints
- ✅ `GET /api/wills/:id/people` - List people
- ✅ `POST /api/wills/:id/people` - Add person
- ✅ `PATCH /api/wills/:id/people/:personId` - Update person
- ✅ `DELETE /api/wills/:id/people/:personId` - Delete person
- ✅ `POST /api/wills/:id/people/guardians` - Assign guardian
- ✅ `GET /api/wills/:id/people/guardians` - Get guardians

### Assets Endpoints
- ✅ `GET /api/wills/:id/assets` - List assets
- ✅ `POST /api/wills/:id/assets` - Add asset
- ✅ `PATCH /api/wills/:id/assets/:assetId` - Update asset
- ✅ `DELETE /api/wills/:id/assets/:assetId` - Delete asset

### Arrangements Endpoints (Need Verification)
- ⚠️ `GET /api/wills/:id/executor` - Get executor
- ⚠️ `POST /api/wills/:id/executor` - Assign executor
- ⚠️ `GET /api/wills/:id/witnesses` - Get witnesses
- ⚠️ `POST /api/wills/:id/witnesses` - Add witness
- ⚠️ `POST /api/wills/:id/signature` - Upload signature
- ⚠️ `POST /api/wills/:id/consent` - Upload consent video

### Inheritance Endpoints (Need Verification)
- ⚠️ `GET /api/wills/:id/inheritance/scenarios` - Get scenarios
- ⚠️ `PATCH /api/wills/:id/inheritance/scenarios` - Update scenario

### File Upload Endpoints (Missing)
- ❌ `POST /api/upload/photo` - Upload photo
- ❌ `POST /api/upload/signature` - Upload signature
- ❌ `POST /api/upload/video` - Upload video

## Recommendations

### High Priority
1. **Verify ArrangementsService** - Check if all methods exist and are properly implemented
2. **Verify InheritanceService** - Check if service file exists and has all methods
3. **Implement File Upload** - Add photo/signature/video upload endpoints
4. **Remove Demo Mode** - Once backend is ready, remove demo mode fallbacks (or make them optional)

### Medium Priority
1. **Add Error Handling** - Ensure all API calls have proper error handling
2. **Add Loading States** - Ensure all screens show loading indicators during API calls
3. **Add Retry Logic** - Add retry mechanism for failed API calls
4. **Add Offline Support** - Consider caching for offline mode

### Low Priority
1. **Add API Response Validation** - Validate API responses match expected format
2. **Add Request Logging** - Log API requests for debugging
3. **Add Response Caching** - Cache API responses for better performance

## Testing Checklist

- [ ] Test all API endpoints with real backend
- [ ] Verify demo mode works when backend is unavailable
- [ ] Test error handling for network failures
- [ ] Test file uploads (photos, signatures, videos)
- [ ] Verify all screens load data correctly
- [ ] Test navigation between screens with API data
- [ ] Verify state persistence across screen navigation
