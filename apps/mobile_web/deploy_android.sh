#!/bin/bash

# Optimized Build and install script for Mywasiyat
# Usage: ./deploy_android.sh [device-id]

set -e

# Default to the current connected device if not provided
DEVICE_ID="${1:-00175353O001116}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Android deployment for device: $DEVICE_ID"

# 1. Update local IP for backend connectivity
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
echo "🌐 Local IP detected: $LOCAL_IP"

# Update api_client.dart (using sed)
# Note: This is a bit risky with sed on Mac, but we already updated it manually.
# For a script, it's better to just run flutter run.

echo "🔨 Running app on device..."
cd "$PROJECT_DIR"
flutter run -d "$DEVICE_ID"

# If you just want to build and install (no logs/hot reload):
# flutter install -d "$DEVICE_ID"
