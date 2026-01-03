#!/bin/bash

echo "=== ANDROID BUILD STATUS CHECK ==="
echo ""
echo "1. Device Connection:"
adb devices
echo ""
echo "2. App Installation Status:"
if adb shell pm list packages | grep -i whatsay > /dev/null 2>&1; then
    echo "✅ WhatSay app IS INSTALLED"
    adb shell pm list packages | grep -i whatsay
else
    echo "❌ WhatSay app NOT INSTALLED yet"
fi
echo ""
echo "3. Build Processes Running:"
BUILD_PROCS=$(ps aux | grep -E "[e]xpo.*android|[g]radle|java.*gradle" | wc -l | tr -d ' ')
if [ "$BUILD_PROCS" -gt 0 ]; then
    echo "✅ Build processes are RUNNING ($BUILD_PROCS found)"
    ps aux | grep -E "[e]xpo.*android|[g]radle|java.*gradle" | head -5
else
    echo "❌ No build processes running"
fi
echo ""
echo "4. APK Files:"
if [ -f android/app/build/outputs/apk/debug/app-debug.apk ] || [ -f android/app/build/outputs/apk/release/app-release.apk ]; then
    echo "✅ APK file EXISTS"
    ls -lh android/app/build/outputs/apk/*/app-*.apk 2>/dev/null | head -3
else
    echo "⏳ APK file NOT FOUND (build may not have started or completed)"
fi
echo ""
echo "5. Metro Bundler:"
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "✅ Metro bundler is RUNNING on port 8081"
else
    echo "❌ Metro bundler NOT running"
fi
echo ""
echo "6. Currently Running App:"
adb shell dumpsys window windows | grep -E 'mCurrentFocus' | head -1
echo ""
echo "=== STATUS CHECK COMPLETE ==="
