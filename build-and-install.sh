#!/bin/bash

cd /Users/basith/Documents/whatsay-app-main

echo "========================================="
echo "WHATSAY APP - BUILD & INSTALL"
echo "========================================="
echo ""

# Step 1: Check device
echo "STEP 1/7: Checking device connection..."
if ! adb devices | grep -q "device$"; then
    echo "❌ ERROR: No device connected!"
    echo "Please connect your Android phone and enable USB debugging"
    exit 1
fi
echo "✅ Device connected"
adb devices | grep -v "List"
echo ""

# Step 2: Prebuild
echo "STEP 2/7: Preparing Android project..."
if [ ! -d "android" ]; then
    echo "   Running prebuild (this may take a minute)..."
    npx expo prebuild --platform android --clean
    echo "✅ Android project created"
else
    echo "✅ Android project already exists"
fi
echo ""

# Step 3: Clean
echo "STEP 3/7: Cleaning previous build..."
cd android
./gradlew clean
echo "✅ Clean complete"
cd ..
echo ""

# Step 4: Build APK
echo "STEP 4/7: Building APK..."
echo "   This will take 5-10 minutes - you'll see progress below:"
echo "   ========================================="
cd android
./gradlew assembleDebug
BUILD_RESULT=$?
cd ..
echo "   ========================================="

if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ BUILD FAILED!"
    echo "Check the error messages above"
    exit 1
fi
echo "✅ Build successful!"
echo ""

# Step 5: Find APK
echo "STEP 5/7: Locating APK file..."
APK=$(find android/app/build/outputs/apk -name "app-debug.apk" 2>/dev/null | head -1)
if [ -z "$APK" ]; then
    echo "❌ ERROR: APK not found!"
    exit 1
fi
echo "✅ APK found: $APK"
ls -lh "$APK"
echo ""

# Step 6: Install
echo "STEP 6/7: Installing to device..."
echo "   Installing: $APK"
adb install -r "$APK"
INSTALL_RESULT=$?

if [ $INSTALL_RESULT -ne 0 ]; then
    echo "❌ INSTALLATION FAILED!"
    echo "Check error messages above"
    exit 1
fi
echo "✅ Installation successful!"
echo ""

# Step 7: Verify and Launch
echo "STEP 7/7: Verifying installation..."
if adb shell pm list packages | grep -q "whatsay"; then
    echo "✅ App is installed!"
    echo ""
    echo "Launching app..."
    adb shell monkey -p com.safwanambat.whatsay -c android.intent.category.LAUNCHER 1
    echo ""
    echo "========================================="
    echo "✅✅✅ SUCCESS!"
    echo "========================================="
    echo "The WhatSay app should now be on your phone!"
    echo "Check your phone - the app should be launching now."
else
    echo "❌ App not found after installation"
    exit 1
fi
