#!/bin/bash

LOG_FILE="/Users/basith/Documents/whatsay-app-main/build-progress.log"

echo "📱 Android Build Progress"
echo "========================="
echo ""

while true; do
    if [ ! -f "$LOG_FILE" ]; then
        sleep 2
        continue
    fi
    
    LATEST=$(tail -200 "$LOG_FILE" 2>/dev/null)
    
    # Check completion
    if echo "$LATEST" | grep -q "BUILD SUCCESSFUL"; then
        echo ""
        echo "✅✅✅ BUILD SUCCESSFUL! (100%)"
        echo ""
        APK_PATH=$(echo "$LATEST" | grep -oE "app/build/outputs/apk/.*\.apk" | tail -1)
        if [ -n "$APK_PATH" ]; then
            echo "📦 APK Location: android/$APK_PATH"
        fi
        break
    fi
    
    if echo "$LATEST" | grep -q "BUILD FAILED"; then
        echo ""
        echo "❌ BUILD FAILED"
        tail -30 "$LOG_FILE" | grep -i -E "(error|failed|exception)" | head -10
        break
    fi
    
    # Progress stages
    if echo "$LATEST" | grep -q "Downloading.*gradle"; then
        PERCENT=$(echo "$LATEST" | grep -oE "[0-9]+%" | tail -1)
        echo -ne "\r📥 Downloading Gradle: $PERCENT"
    elif echo "$LATEST" | grep -q "Starting a Gradle Daemon"; then
        echo -ne "\r⏳ Starting Gradle Daemon (first time, may take 1-2 min)..."
    elif echo "$LATEST" | grep -qE "> Task.*:app:preBuild"; then
        echo -ne "\r🔨 Stage 1/7: Pre-build setup..."
    elif echo "$LATEST" | grep -qE "> Task.*:app:compileDebugJavaWithJavac"; then
        TASKS=$(echo "$LATEST" | grep -c "> Task" 2>/dev/null || echo "0")
        echo -ne "\r💻 Stage 2/7: Compiling Java/Kotlin ($TASKS tasks)..."
    elif echo "$LATEST" | grep -qE "> Task.*:app:mergeDebugResources"; then
        TASKS=$(echo "$LATEST" | grep -c "> Task" 2>/dev/null || echo "0")
        echo -ne "\r🎨 Stage 3/7: Processing resources ($TASKS tasks)..."
    elif echo "$LATEST" | grep -qE "> Task.*:app:processDebugManifest"; then
        TASKS=$(echo "$LATEST" | grep -c "> Task" 2>/dev/null || echo "0")
        echo -ne "\r📋 Stage 4/7: Processing manifest ($TASKS tasks)..."
    elif echo "$LATEST" | grep -qE "> Task.*:app:packageDebug"; then
        TASKS=$(echo "$LATEST" | grep -c "> Task" 2>/dev/null || echo "0")
        echo -ne "\r📦 Stage 5/7: Packaging APK ($TASKS tasks)..."
    elif echo "$LATEST" | grep -qE "> Task.*:app:assembleDebug"; then
        TASKS=$(echo "$LATEST" | grep -c "> Task" 2>/dev/null || echo "0")
        echo -ne "\r🏗️  Stage 6/7: Assembling APK ($TASKS tasks)..."
    elif echo "$LATEST" | grep -qE "> Task"; then
        TASKS=$(echo "$LATEST" | grep -c "> Task" 2>/dev/null || echo "0")
        echo -ne "\r⚙️  Building... ($TASKS tasks completed)"
    else
        echo -ne "\r🚀 Initializing..."
    fi
    
    sleep 2
done

echo ""
echo ""
echo "📋 Latest build output:"
tail -10 "$LOG_FILE" | grep -v "^$"
