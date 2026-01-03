#!/bin/bash

echo "========================================="
echo "BUILD PROGRESS CHECK"
echo "Time: $(date)"
echo "========================================="
echo ""

echo "1. BUILD PROCESSES:"
BUILD_COUNT=$(ps aux | grep -E "[e]xpo.*android|[g]radle|java.*gradle" | wc -l | tr -d ' ')
if [ "$BUILD_COUNT" -gt 0 ]; then
    echo "✅ BUILD IS RUNNING ($BUILD_COUNT processes)"
    ps aux | grep -E "[e]xpo.*android|[g]radle|java.*gradle" | head -3
else
    echo "❌ No build processes running"
fi
echo ""

echo "2. APK FILES:"
APK_COUNT=$(find android/app/build/outputs/apk -name "*.apk" 2>/dev/null | wc -l | tr -d ' ')
if [ "$APK_COUNT" -gt 0 ]; then
    echo "✅ APK BUILT ($APK_COUNT file(s))"
    find android/app/build/outputs/apk -name "*.apk" 2>/dev/null | head -3
    ls -lh android/app/build/outputs/apk/*/app-*.apk 2>/dev/null | head -3
else
    echo "⏳ APK not built yet (build in progress)"
fi
echo ""

echo "3. APP INSTALLATION:"
if adb shell pm list packages | grep -q whatsay; then
    echo "✅✅✅ APP IS INSTALLED ON YOUR PHONE!"
    adb shell pm list packages | grep whatsay
else
    echo "⏳ App not installed yet (waiting for build to complete)"
fi
echo ""

echo "4. DEVICE CONNECTION:"
if adb devices | grep -q "device$"; then
    echo "✅ Device connected"
    adb devices | grep -v "List"
else
    echo "❌ Device not connected!"
fi
echo ""

echo "5. BUILD DIRECTORY:"
if [ -d "android/app/build" ]; then
    SIZE=$(du -sh android/app/build 2>/dev/null | cut -f1)
    echo "✅ Build directory exists (Size: $SIZE)"
else
    echo "⏳ Build directory not created yet"
fi
echo ""

echo "========================================="
if [ "$BUILD_COUNT" -gt 0 ]; then
    echo "STATUS: ✅ BUILD IS PROGRESSING"
    echo "Wait 5-10 minutes for completion"
elif [ "$APK_COUNT" -gt 0 ]; then
    echo "STATUS: ✅ BUILD COMPLETE - Installing..."
elif adb shell pm list packages | grep -q whatsay; then
    echo "STATUS: ✅✅✅ SUCCESS - APP IS INSTALLED!"
else
    echo "STATUS: ⏳ Starting build process..."
fi
echo "========================================="
