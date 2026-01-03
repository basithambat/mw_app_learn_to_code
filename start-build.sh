#!/bin/bash

echo "========================================="
echo "WHATSAY APP - STARTING EAS BUILD"
echo "========================================="
echo ""

# Check login
if ! eas whoami &>/dev/null; then
    echo "⚠️  You need to login first!"
    echo ""
    echo "Run this command:"
    echo "  eas login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged in to EAS"
echo ""
echo "Starting Android production build..."
echo "Version: 1.0.4"
echo ""

eas build --platform android --profile production

echo ""
echo "✅ Build submitted!"
