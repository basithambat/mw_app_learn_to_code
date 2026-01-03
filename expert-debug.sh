#!/bin/bash

echo "========================================="
echo "EXPERT DEBUGGING - WhatSay App Installation"
echo "========================================="
echo ""

# Step 1: Device Check
echo "1. DEVICE CONNECTION:"
DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l | tr -d ' ')
if [ "$DEVICES" -eq 0 ]; then
    echo "❌ CRITICAL: No device connected!"
    echo "   - Connect phone via USB"
    echo "   - Enable USB debugging"
    echo "   - Trust computer on phone"
    exit 1
else
    echo "✅ Device connected ($DEVICES device(s))"
    adb devices
fi
echo ""

# Step 2: Check Android Project
echo "2. ANDROID PROJECT:"
if [ ! -d "android" ]; then
    echo "❌ Android project missing!"
    echo "   Running: npx expo prebuild --platform android"
    npx expo prebuild --platform android
else
    echo "✅ Android project exists"
fi
echo ""

# Step 3: Check Package Name
echo "3. PACKAGE NAME:"
PACKAGE=$(grep -o 'package="[^"]*"' android/app/src/main/AndroidManifest.xml | cut -d'"' -f2)
echo "   Package: $PACKAGE"
echo ""

# Step 4: Check if app already installed
echo "4. EXISTING INSTALLATION:"
if adb shell pm list packages | grep -i "$PACKAGE" > /dev/null 2>&1; then
    echo "⚠️  App already installed - will uninstall first"
    adb uninstall "$PACKAGE" 2>/dev/null
    echo "   Uninstalled old version"
else
    echo "✅ No existing installation"
fi
echo ""

# Step 5: Clean build
echo "5. CLEANING BUILD:"
cd android
./gradlew clean > /dev/null 2>&1
echo "✅ Cleaned"
cd ..
echo ""

# Step 6: Build APK
echo "6. BUILDING APK:"
echo "   This may take 5-10 minutes..."
cd android
./gradlew assembleDebug 2>&1 | tee ../build-output.log
BUILD_SUCCESS=$?
cd ..

if [ $BUILD_SUCCESS -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed - check build-output.log"
    exit 1
fi
echo ""

# Step 7: Find APK
echo "7. LOCATING APK:"
APK=$(find android/app/build/outputs/apk -name "app-debug.apk" 2>/dev/null | head -1)
if [ -z "$APK" ]; then
    echo "❌ APK not found!"
    exit 1
else
    echo "✅ APK found: $APK"
    ls -lh "$APK"
fi
echo ""

# Step 8: Install APK
echo "8. INSTALLING APK:"
adb install -r "$APK" 2>&1 | tee install-output.log
INSTALL_SUCCESS=$?

if [ $INSTALL_SUCCESS -eq 0 ]; then
    echo "✅ Installation successful!"
else
    echo "❌ Installation failed - check install-output.log"
    cat install-output.log
    exit 1
fi
echo ""

# Step 9: Verify Installation
echo "9. VERIFYING INSTALLATION:"
if adb shell pm list packages | grep -i "$PACKAGE" > /dev/null 2>&1; then
    echo "✅ App is installed!"
    adb shell pm list packages | grep -i "$PACKAGE"
else
    echo "❌ App not found after installation!"
    exit 1
fi
echo ""

# Step 10: Launch App
echo "10. LAUNCHING APP:"
adb shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1
echo "✅ Launch command sent"
echo ""

echo "========================================="
echo "✅ SUCCESS! App should now be on your phone"
echo "========================================="
