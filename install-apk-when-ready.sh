#!/bin/bash

cd /Users/basith/Documents/whatsay-app-main

echo "🔍 Waiting for APK to be built..."
echo ""

APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
ADB_PATH="/Users/basith/Library/Android/sdk/platform-tools/adb"
MAX_WAIT=600  # 10 minutes
CHECK_INTERVAL=10
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
  if [ -f "$APK_PATH" ]; then
    echo "✅ APK found! Installing on device..."
    echo ""
    echo "APK Location: $APK_PATH"
    echo "APK Size: $(ls -lh "$APK_PATH" | awk '{print $5}')"
    echo ""
    
    # Install APK
    $ADB_PATH install -r "$APK_PATH"
    
    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ Installed successfully! Launching app..."
      echo ""
      
      # Launch app
      $ADB_PATH shell monkey -p com.safwanambat.whatsay -c android.intent.category.LAUNCHER 1
      
      echo ""
      echo "🎉 App installed and launched on your device!"
      echo ""
      echo "📱 APK is also available at:"
      echo "   $APK_PATH"
      echo ""
      echo "You can share this file via:"
      echo "  - Email it to yourself"
      echo "  - AirDrop (Mac)"
      echo "  - USB transfer"
      echo "  - Cloud storage (Google Drive, etc.)"
      exit 0
    else
      echo "❌ Installation failed"
      echo ""
      echo "📱 APK is available at:"
      echo "   $APK_PATH"
      echo ""
      echo "You can manually install by:"
      echo "  1. Transfer APK to phone"
      echo "  2. Open APK file on phone"
      echo "  3. Allow 'Install from unknown sources' if prompted"
      echo "  4. Tap Install"
      exit 1
    fi
  fi
  
  sleep $CHECK_INTERVAL
  ELAPSED=$((ELAPSED + CHECK_INTERVAL))
  
  if [ $((ELAPSED % 60)) -eq 0 ]; then
    echo "⏳ Still building... ($((ELAPSED / 60)) minutes elapsed)"
  fi
done

echo "⏱️ Timeout: Build took longer than 10 minutes"
echo "Check build status manually:"
echo "  ls $APK_PATH"
exit 1
