# Build Instructions for Mywasiyat Flutter App

## Prerequisites

- Flutter SDK installed (3.38.5+)
- Android SDK installed (for Android builds)
- Connected Android device or emulator (for device builds)
- Backend API running on `http://localhost:3000`

## Current Status

### ✅ Completed
- Theme system with React design colors
- Google Fonts integration (Frank Ruhl Libre, Lato)
- Reusable component library
- Dashboard screen (enhanced)
- Family screen (enhanced)
- Splash screen (animated)

### ⚠️ Partially Complete
- Basic Info screen (functional, needs UI polish)
- Login screen (functional, needs UI polish)
- Inheritance screen (basic structure)
- Arrangements screen (basic structure)
- Assets screen (basic structure)
- Assistant screen (functional, needs UI polish)

## Build Options

### Option 1: Run on Connected Android Device

```bash
cd apps/mobile_web
flutter run -d <device-id>
```

To see available devices:
```bash
flutter devices
```

### Option 2: Build APK for Android

```bash
cd apps/mobile_web
flutter build apk --release
```

The APK will be generated at:
`apps/mobile_web/build/app/outputs/flutter-apk/app-release.apk`

### Option 3: Build App Bundle for Play Store

```bash
cd apps/mobile_web
flutter build appbundle --release
```

The AAB will be generated at:
`apps/mobile_web/build/app/outputs/bundle/release/app-release.aab`

### Option 4: Run on Web (Chrome)

```bash
cd apps/mobile_web
flutter run -d chrome
```

### Option 5: Run on macOS Desktop

```bash
cd apps/mobile_web
flutter run -d macos
```

## Pre-Build Checklist

1. ✅ **Backend Running**: Ensure backend API is running on `http://localhost:3000`
2. ✅ **Dependencies**: Run `flutter pub get` in `apps/mobile_web/`
3. ✅ **Environment**: Check that API base URL is correct in services
4. ⚠️ **Fonts**: Google Fonts will download automatically (no manual setup needed)
5. ⚠️ **Assets**: Ensure image assets are in `assets/images/` and `assets/icons/`

## Quick Start

### For Development/Testing

```bash
# 1. Start backend (in another terminal)
cd apps/api
npm run start:dev

# 2. Run Flutter app on connected device
cd apps/mobile_web
flutter run -d <device-id>
```

### For Production Build

```bash
cd apps/mobile_web

# Build release APK
flutter build apk --release

# Or build app bundle for Play Store
flutter build appbundle --release
```

## Known Issues

1. **Deprecation Warnings**: Some `withOpacity` calls show deprecation warnings (non-critical)
2. **Unused Imports**: Some unused imports in screens (non-critical, can be cleaned up)
3. **Test File**: Widget test references old `MyApp` class (fixed)

## Device Connection

Your connected device:
- **A059P (mobile)** - Android 16 (API 36) - Ready for builds

To install APK on connected device:
```bash
flutter install
```

Or manually:
```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

## Build Configuration

### Android Configuration
- Minimum SDK: Check `android/app/build.gradle`
- Target SDK: Check `android/app/build.gradle`
- Package name: `com.mywasiyat.app` (verify in `android/app/build.gradle`)

### Signing (for Release)
Release builds require signing. Configure in:
- `android/key.properties` (create if needed)
- `android/app/build.gradle` (signing config)

## Troubleshooting

### Build Fails
1. Run `flutter clean`
2. Run `flutter pub get`
3. Check `flutter doctor` for issues
4. Verify backend is running

### Fonts Not Loading
- Google Fonts downloads automatically on first run
- Check internet connection
- Fonts are cached after first download

### API Connection Issues
- Verify backend is running on `http://localhost:3000`
- Check API base URL in service files
- For physical device, use your computer's IP address instead of `localhost`

## Next Steps After Build

1. Test all screens and navigation
2. Verify API integration
3. Test on multiple devices
4. Complete remaining screen enhancements
5. Add error handling improvements
6. Performance optimization
