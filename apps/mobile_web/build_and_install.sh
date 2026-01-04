#!/bin/bash

# Build and install Flutter app on connected Android device
# Usage: ./build_and_install.sh [device-id]

set -e

DEVICE_ID="${1:-00175353O001116}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APK_PATH="$PROJECT_DIR/build/app/outputs/flutter-apk/app-debug.apk"
ADB_PATH="/Users/basith/Library/Android/sdk/platform-tools/adb"

echo "🔨 Building Flutter APK..."
cd "$PROJECT_DIR"
flutter clean > /dev/null 2>&1
flutter pub get > /dev/null 2>&1
flutter build apk --debug

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📱 Installing on device $DEVICE_ID..."
"$ADB_PATH" -s "$DEVICE_ID" install -r "$APK_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Build and install successful!"
    echo "📦 APK: $APK_PATH"
else
    echo "❌ Install failed!"
    exit 1
fi
