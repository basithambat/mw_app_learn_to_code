#!/bin/bash

LOG_FILE="/Users/basith/Documents/whatsay-app-main/build-progress.log"
APK_PATH="/Users/basith/Documents/whatsay-app-main/android/app/build/outputs/apk/debug/app-debug.apk"
DEVICE_ID="00175353O001116"
ADB_PATH="$HOME/Library/Android/sdk/platform-tools/adb"

echo "📱 WhatSay App - Build & Install Monitor"
echo "=========================================="
echo ""

while true; do
    if [ ! -f "$LOG_FILE" ]; then
        sleep 3
        continue
    fi
    
    LATEST=$(tail -5000 "$LOG_FILE" 2>/dev/null)
    
    # Check for success
    if echo "$LATEST" | grep -q "BUILD SUCCESSFUL"; then
        echo ""
        echo "✅✅✅ BUILD SUCCESSFUL! (100%)"
        echo ""
        
        if [ -f "$APK_PATH" ]; then
            echo "📦 APK found: $APK_PATH"
            echo ""
            echo "📲 Installing on device..."
            "$ADB_PATH" -s "$DEVICE_ID" install -r "$APK_PATH" 2>&1 | tee /tmp/install.log
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅✅✅ INSTALLATION SUCCESSFUL!"
                echo ""
                echo "🚀 Launching app..."
                "$ADB_PATH" -s "$DEVICE_ID" shell am start -n com.safwanambat.whatsay/.MainActivity
                echo ""
                echo "🎉 WhatSay app should now be running on your phone!"
                break
            else
                echo ""
                echo "⚠️  Installation had issues. Check /tmp/install.log"
                cat /tmp/install.log | tail -10
            fi
        else
            echo "⚠️  APK not found at expected location"
            find /Users/basith/Documents/whatsay-app-main/android -name "*.apk" 2>/dev/null | head -3
        fi
        break
    fi
    
    # Check for failure
    if echo "$LATEST" | grep -q "BUILD FAILED"; then
        echo ""
        echo "❌ BUILD FAILED"
        echo ""
        tail -30 "$LOG_FILE" | grep -i -E "(error|failed|exception)" | head -10
        break
    fi
    
    # Show progress
    TOTAL=$(echo "$LATEST" | grep -c "> Task" 2>/dev/null || echo "0")
    
    if [ "$TOTAL" -gt 0 ]; then
        PERCENT=$((TOTAL * 100 / 300))
        if [ "$PERCENT" -gt 95 ]; then PERCENT=95; fi
        
        CURRENT=$(echo "$LATEST" | grep "> Task" | tail -1 | sed 's/> Task //' | cut -d' ' -f1-2)
        echo -ne "\r🔨 Building... ~$PERCENT% | Tasks: $TOTAL | ${CURRENT:0:50}                    "
    else
        echo -ne "\r⏳ Initializing build...                    "
    fi
    
    sleep 5
done

echo ""
echo "📋 Final Status:"
tail -5 "$LOG_FILE"
