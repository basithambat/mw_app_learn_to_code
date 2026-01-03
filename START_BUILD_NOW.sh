#!/bin/bash

cd /Users/basith/Documents/whatsay-app-main

echo "========================================="
echo "STARTING BUILD - YOU'LL SEE PROGRESS"
echo "========================================="
echo ""

# Check device
echo "1. Checking device..."
if ! adb devices | grep -q "device$"; then
    echo "❌ Device not connected!"
    exit 1
fi
echo "✅ Device connected"
echo ""

# Prebuild if needed
echo "2. Setting up Android project..."
if [ ! -d "android" ]; then
    echo "   Creating Android project (1-2 minutes)..."
    npx expo prebuild --platform android --clean
fi
echo "✅ Ready"
echo ""

# Build
echo "3. Building APK (5-10 minutes)..."
echo "   You'll see progress below:"
echo "   ========================================="
cd android
./gradlew clean assembleDebug
BUILD_RESULT=$?
cd ..
echo "   ========================================="

if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ BUILD FAILED - Check errors above"
    exit 1
fi

echo "✅ Build complete!"
echo ""

# Install
echo "4. Installing to device..."
APK=$(find android/app/build/outputs/apk -name "app-debug.apk" 2>/dev/null | head -1)
if [ -z "$APK" ]; then
    echo "❌ APK not found!"
    exit 1
fi

echo "   Installing: $APK"
adb install -r "$APK"
if [ $? -eq 0 ]; then
    echo "✅ Installation successful!"
    echo ""
    echo "5. Launching app..."
    adb shell monkey -p com.safwanambat.whatsay -c android.intent.category.LAUNCHER 1
    echo ""
    echo "========================================="
    echo "✅✅✅ SUCCESS! APP IS ON YOUR PHONE!"
    echo "========================================="
else
    echo "❌ Installation failed"
    exit 1
fi
