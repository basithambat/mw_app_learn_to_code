# Quick Build & Install

## Automated Build Script

A script is available to automatically build and install the app on your connected device:

```bash
cd apps/mobile_web
./build_and_install.sh
```

Or with a specific device ID:
```bash
./build_and_install.sh <device-id>
```

## What It Does

1. Cleans the build directory
2. Gets dependencies (`flutter pub get`)
3. Builds debug APK (`flutter build apk --debug`)
4. Installs on connected device via ADB

## Default Device

The script uses device ID `00175353O001116` (A059P) by default.

## Manual Steps

If you prefer to do it manually:

```bash
cd apps/mobile_web
flutter clean
flutter pub get
flutter build apk --debug
adb -s 00175353O001116 install -r build/app/outputs/flutter-apk/app-debug.apk
```

## Notes

- The script uses the ADB path: `/Users/basith/Library/Android/sdk/platform-tools/adb`
- For release builds, modify the script to use `--release` flag
- Make sure your device is connected and USB debugging is enabled
