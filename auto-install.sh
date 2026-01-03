#!/bin/bash

cd /Users/basith/Documents/whatsay-app-main

echo "========================================="
echo "AUTOMATIC BUILD & INSTALL"
echo "========================================="
echo ""

# Step 1: Verify device
echo "1. Checking device..."
if ! adb devices | grep -q "device$"; then
    echo "❌ No device connected!"
    exit 1
fi
echo "✅ Device connected"
echo ""

# Step 2: Prebuild if needed
echo "2. Setting up Android project..."
if [ ! -d "android" ]; then
    echo "   Running prebuild..."
    npx expo prebuild --platform android --clean
fi
echo "✅ Android project ready"
echo ""

# Step 3: Build APK
echo "3. Building APK (this takes 5-10 minutes)..."
cd android
./gradlew clean assembleDebug > ../build.log 2>&1 &
GRADLE_PID=$!
cd ..

# Wait for build
echo "   Build started, waiting..."
BUILD_WAIT=0
MAX_WAIT=600  # 10 minutes

while [ $BUILD_WAIT -lt $MAX_WAIT ]; do
    APK=$(find android/app/build/outputs/apk -name "app-debug.apk" 2>/dev/null | head -1)
    if [ -n "$APK" ]; then
        echo "✅ APK built successfully!"
        break
    fi
    
    # Check if gradle is still running
    if ! ps -p $GRADLE_PID > /dev/null 2>&1; then
        echo "   Build process finished, checking for APK..."
        sleep 5
        APK=$(find android/app/build/outputs/apk -name "app-debug.apk" 2>/dev/null | head -1)
        if [ -z "$APK" ]; then
            echo "❌ Build may have failed. Check build.log"
            tail -30 build.log
            exit 1
        fi
        break
    fi
    
    echo "   Still building... ($BUILD_WAIT seconds)"
    sleep 10
    BUILD_WAIT=$((BUILD_WAIT + 10))
done

if [ -z "$APK" ]; then
    echo "❌ Build timeout or failed"
    exit 1
fi

echo ""
echo "4. Installing APK..."
adb install -r "$APK" 2>&1
INSTALL_RESULT=$?

if [ $INSTALL_RESULT -eq 0 ]; then
    echo "✅ Installation successful!"
else
    echo "⚠️  Installation had issues, but continuing..."
fi

echo ""
echo "5. Verifying installation..."
if adb shell pm list packages | grep -q "whatsay"; then
    echo "✅ App is installed!"
    echo ""
    echo "6. Launching app..."
    adb shell monkey -p com.safwanambat.whatsay -c android.intent.category.LAUNCHER 1
    echo "✅ Launch command sent!"
    echo ""
    echo "========================================="
    echo "✅✅✅ SUCCESS! App should be on your phone!"
    echo "========================================="
else
    echo "❌ App not found after installation"
    exit 1
fi
