#!/bin/bash
cd /Users/basith/Documents/whatsay-app-main

echo "=========================================" > status-report.txt
echo "WHATSAY ANDROID BUILD STATUS REPORT" >> status-report.txt
echo "Generated: $(date)" >> status-report.txt
echo "=========================================" >> status-report.txt
echo "" >> status-report.txt

echo "1. DEVICE CONNECTION:" >> status-report.txt
adb devices >> status-report.txt 2>&1
echo "" >> status-report.txt

echo "2. APP INSTALLATION STATUS:" >> status-report.txt
if adb shell pm list packages | grep -i whatsay > /dev/null 2>&1; then
    echo "✅ APP IS INSTALLED" >> status-report.txt
    adb shell pm list packages | grep -i whatsay >> status-report.txt
else
    echo "❌ APP NOT INSTALLED YET" >> status-report.txt
fi
echo "" >> status-report.txt

echo "3. BUILD PROCESSES:" >> status-report.txt
BUILD_COUNT=$(ps aux | grep -E "[e]xpo.*android|[g]radle|java.*gradle" | wc -l | tr -d ' ')
echo "Active build processes: $BUILD_COUNT" >> status-report.txt
if [ "$BUILD_COUNT" -gt 0 ]; then
    ps aux | grep -E "[e]xpo.*android|[g]radle|java.*gradle" | head -3 >> status-report.txt
fi
echo "" >> status-report.txt

echo "4. APK FILES:" >> status-report.txt
if find android/app/build/outputs -name "*.apk" 2>/dev/null | head -1 > /dev/null; then
    echo "✅ APK FILES FOUND:" >> status-report.txt
    find android/app/build/outputs -name "*.apk" 2>/dev/null | head -3 >> status-report.txt
else
    echo "❌ NO APK FILES FOUND" >> status-report.txt
fi
echo "" >> status-report.txt

echo "5. METRO BUNDLER:" >> status-report.txt
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "✅ RUNNING on port 8081" >> status-report.txt
else
    echo "❌ NOT RUNNING" >> status-report.txt
fi
echo "" >> status-report.txt

echo "6. BUILD LOG (last 20 lines):" >> status-report.txt
tail -20 build-log.txt 2>/dev/null >> status-report.txt || echo "No build log available" >> status-report.txt
echo "" >> status-report.txt

echo "=========================================" >> status-report.txt
echo "END OF REPORT" >> status-report.txt

cat status-report.txt
