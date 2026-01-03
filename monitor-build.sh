#!/bin/bash

LOG_FILE="/Users/basith/Documents/whatsay-app-main/build-progress.log"
BUILD_PID=$(ps aux | grep "[g]radlew assembleDebug" | awk '{print $2}' | head -1)

if [ -z "$BUILD_PID" ]; then
    echo "Build process not found. Checking log..."
fi

echo "📱 Android Build Progress Monitor"
echo "=================================="
echo ""

while true; do
    if [ ! -f "$LOG_FILE" ]; then
        sleep 2
        continue
    fi
    
    # Get latest progress
    LATEST=$(tail -100 "$LOG_FILE" 2>/dev/null)
    
    # Check if build is complete
    if echo "$LATEST" | grep -q "BUILD SUCCESSFUL"; then
        echo ""
        echo "✅ BUILD SUCCESSFUL! (100%)"
        echo ""
        tail -10 "$LOG_FILE" | grep -E "(BUILD|APK|installed)"
        break
    fi
    
    if echo "$LATEST" | grep -q "BUILD FAILED"; then
        echo ""
        echo "❌ BUILD FAILED"
        echo ""
        tail -20 "$LOG_FILE" | grep -i error
        break
    fi
    
    # Show current stage
    STAGE=""
    PERCENT=""
    
    if echo "$LATEST" | grep -q "Downloading.*gradle"; then
        PERCENT=$(echo "$LATEST" | grep -oE "[0-9]+%" | tail -1)
        STAGE="📥 Downloading Gradle: $PERCENT"
    elif echo "$LATEST" | grep -qE "Task.*:compile"; then
        TASKS=$(echo "$LATEST" | grep -c "> Task" || echo "0")
        STAGE="🔨 Compiling ($TASKS tasks completed)"
    elif echo "$LATEST" | grep -qE "> Task.*:process"; then
        STAGE="⚙️  Processing resources..."
    elif echo "$LATEST" | grep -qE "> Task.*:package"; then
        STAGE="📦 Packaging APK..."
    elif echo "$LATEST" | grep -qE "> Task.*:assemble"; then
        STAGE="🏗️  Assembling APK..."
    elif echo "$LATEST" | grep -q "BUILD"; then
        STAGE="⏳ Build in progress..."
    else
        STAGE="🚀 Initializing build..."
    fi
    
    # Count completed tasks for progress estimate
    TOTAL_TASKS=$(echo "$LATEST" | grep -c "> Task" 2>/dev/null || echo "0")
    TOTAL_TASKS=$(echo "$TOTAL_TASKS" | tr -d ' ')
    
    if [ -n "$TOTAL_TASKS" ] && [ "$TOTAL_TASKS" -gt 0 ] 2>/dev/null; then
        echo -ne "\r$STAGE (Tasks: $TOTAL_TASKS)                    "
    else
        echo -ne "\r$STAGE                    "
    fi
    
    sleep 3
done

echo ""
echo ""
echo "📋 Final Build Status:"
tail -5 "$LOG_FILE"
