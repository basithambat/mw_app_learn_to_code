#!/bin/bash

echo "========================================="
echo "BUILD DIAGNOSTIC CHECK"
echo "========================================="
echo ""

echo "1. DEVICE CONNECTION:"
DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device" | wc -l | tr -d ' ')
if [ "$DEVICE_COUNT" -gt 0 ]; then
    echo "✅ Device is connected"
    adb devices
else
    echo "❌ NO DEVICE CONNECTED!"
    echo "Please connect your Android phone via USB and enable USB debugging"
    exit 1
fi
echo ""

echo "2. ANDROID PROJECT:"
if [ -d "android" ]; then
    echo "✅ Android directory exists"
else
    echo "❌ Android directory missing - need to run: npx expo prebuild"
fi
echo ""

echo "3. BUILD PROCESSES:"
BUILD_PROCS=$(ps aux | grep -E "[e]xpo.*android|[g]radle" | grep -v grep | wc -l | tr -d ' ')
if [ "$BUILD_PROCS" -gt 0 ]; then
    echo "⚠️ Build processes are running ($BUILD_PROCS found)"
    ps aux | grep -E "[e]xpo.*android|[g]radle" | grep -v grep | head -3
else
    echo "❌ No build processes running"
fi
echo ""

echo "4. APP INSTALLATION:"
if adb shell pm list packages | grep -i whatsay > /dev/null 2>&1; then
    echo "✅ App is already installed"
    adb shell pm list packages | grep -i whatsay
else
    echo "❌ App is NOT installed"
fi
echo ""

echo "5. GRADLE STATUS:"
if [ -f "android/gradlew" ]; then
    echo "✅ Gradle wrapper exists"
else
    echo "❌ Gradle wrapper missing"
fi
echo ""

echo "========================================="
echo "RECOMMENDED ACTION:"
echo "========================================="
if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo "1. Connect your Android phone"
    echo "2. Enable USB debugging"
    echo "3. Run: adb devices (to verify)"
elif [ ! -d "android" ]; then
    echo "Run: npx expo prebuild --platform android"
    echo "Then: npx expo run:android --device"
else
    echo "Run: npx expo run:android --device"
    echo ""
    echo "This will show build progress in your terminal"
fi
echo "========================================="
