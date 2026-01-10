#!/bin/bash
cd /Users/basith/Documents/whatsay-app-main
APK="android/app/build/outputs/apk/debug/app-debug.apk"
ADB="/Users/basith/Library/Android/sdk/platform-tools/adb"

if [ -f "$APK" ]; then
  echo "✅ APK READY!"
  ls -lh "$APK"
  echo ""
  echo "📱 Installing on device..."
  $ADB install -r "$APK"
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installed! Launching..."
    $ADB shell monkey -p com.safwanambat.whatsay -c android.intent.category.LAUNCHER 1
    echo ""
    echo "🎉 App installed and launched!"
    echo ""
    echo "📱 APK location: $APK"
  else
    echo "❌ Install failed. APK is at: $APK"
  fi
else
  echo "⏳ APK not ready yet. Building in progress..."
  echo "Run this script again in a minute: ./check-and-install-apk.sh"
fi
