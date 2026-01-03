#!/bin/bash

echo "========================================="
echo "WHATSAY APP - EAS BUILD"
echo "========================================="
echo ""

cd /Users/basith/Documents/whatsay-app-main

# Check if logged in
echo "1. Checking EAS login status..."
if ! eas whoami &>/dev/null; then
    echo "   ⚠️  Not logged in to EAS"
    echo "   Please run: eas login"
    echo "   Then run this script again"
    exit 1
fi

echo "   ✅ Logged in to EAS"
echo ""

# Ask which platform
echo "2. Which platform would you like to build?"
echo "   [1] Android"
echo "   [2] iOS"
echo "   [3] Both"
read -p "   Enter choice (1-3): " PLATFORM_CHOICE

case $PLATFORM_CHOICE in
    1)
        PLATFORM="android"
        ;;
    2)
        PLATFORM="ios"
        ;;
    3)
        PLATFORM="all"
        ;;
    *)
        echo "   Invalid choice, defaulting to Android"
        PLATFORM="android"
        ;;
esac

echo ""
echo "3. Starting build for $PLATFORM..."
echo "   Profile: production"
echo "   Version: 1.0.4"
echo ""

# Start the build
eas build --platform $PLATFORM --profile production

echo ""
echo "========================================="
echo "✅ Build submitted to EAS!"
echo "========================================="
echo ""
echo "Monitor your build at: https://expo.dev/accounts/[your-account]/projects/whatsay/builds"
echo ""
