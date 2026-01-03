#!/bin/bash

# Quick script to start Android emulator and Expo for development

echo "========================================="
echo "🚀 Starting Android Emulator Development"
echo "========================================="
echo ""

# Check if emulator is already running
if adb devices | grep -q "emulator"; then
    echo "✅ Emulator already running"
    adb devices
else
    echo "📱 Starting Android emulator..."
    
    # Try to start existing AVD
    if [ -n "$ANDROID_HOME" ]; then
        AVD_NAME="flutter_emulator"
        echo "Starting AVD: $AVD_NAME"
        $ANDROID_HOME/emulator/emulator -avd "$AVD_NAME" -gpu host &
        
        echo "⏳ Waiting for emulator to boot..."
        sleep 5
        
        # Wait for emulator to be ready
        adb wait-for-device
        echo "✅ Emulator is ready!"
    else
        echo "⚠️  ANDROID_HOME not set. Please set it first."
        exit 1
    fi
fi

echo ""
echo "========================================="
echo "📦 Starting Expo Metro Bundler"
echo "========================================="
echo ""

cd /Users/basith/Documents/whatsay-app-main

# Start Expo
npx expo start

echo ""
echo "========================================="
echo "✅ Ready for Development!"
echo "========================================="
echo ""
echo "When Metro starts, press 'a' to open on Android emulator"
echo "Or scan QR code with emulator"
echo ""
