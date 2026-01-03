# 📱 Android Emulator Development Workflow

## ✅ Your Current Setup

- ✅ **Android Studio:** Installed
- ✅ **ANDROID_HOME:** `/Users/basith/Library/Android/sdk`
- ✅ **ADB:** Working
- ✅ **Existing AVD:** `flutter_emulator`
- ✅ **Emulator Tools:** Available

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Emulator

**Option A: Use Existing AVD**
```bash
$ANDROID_HOME/emulator/emulator -avd flutter_emulator -gpu host &
```

**Option B: Create New AVD (Recommended for React Native)**
1. Open Android Studio
2. **More Actions** → **Virtual Device Manager**
3. **Create Device** → **Pixel 5** → **API 33** → **Finish**
4. Start it from Device Manager

---

### Step 2: Start Expo

```bash
cd /Users/basith/Documents/whatsay-app-main
npx expo start
```

---

### Step 3: Launch on Emulator

When Metro starts:
- **Press 'a'** to open on Android emulator
- **Or** scan QR code with emulator

---

## ⚡ One-Command Start

I've created a script for you:

```bash
./START_EMULATOR_DEV.sh
```

This will:
1. Start emulator (if not running)
2. Wait for it to boot
3. Start Expo Metro bundler
4. Ready for development!

---

## 🎨 Development Workflow

### Daily Workflow

1. **Start emulator** (once per session)
   ```bash
   $ANDROID_HOME/emulator/emulator -avd flutter_emulator -gpu host &
   ```

2. **Start Expo**
   ```bash
   npx expo start
   ```

3. **Press 'a'** when Metro starts

4. **Edit code** → **Save** → **Auto-reloads** ✨

5. **See changes instantly** in emulator!

---

## 🐛 Debugging

### React Native Debugger

1. **Shake emulator** (Cmd+M)
2. **Tap "Debug"**
3. **Chrome opens** → DevTools available

### Logcat

```bash
# View app logs
adb logcat | grep -i "whatsay\|expo\|react"

# Clear and view fresh
adb logcat -c && adb logcat | grep -i "whatsay"
```

### Performance Monitor

- **Shake emulator** → **"Show Perf Monitor"**
- See FPS, memory, etc.

---

## 💡 Benefits

✅ **Instant reload** - No APK build needed  
✅ **Hot reload** - Changes appear immediately  
✅ **Better debugging** - Chrome DevTools, React DevTools  
✅ **Screen recording** - Built into emulator  
✅ **Multiple devices** - Test different screen sizes  
✅ **Faster iteration** - Edit → Save → See changes  

---

## 🔧 Troubleshooting

### Emulator Won't Start

```bash
# Kill existing processes
pkill -9 qemu-system
pkill -9 emulator

# Start fresh
$ANDROID_HOME/emulator/emulator -avd flutter_emulator -gpu host -no-snapshot-load &
```

### Expo Can't Find Emulator

```bash
# Check connection
adb devices

# Restart ADB
adb kill-server
adb start-server

# Verify
adb devices
```

### App Won't Reload

- **Press 'r'** in Metro terminal (reload)
- **Shake emulator** → **"Reload"**
- **Close and reopen** app in emulator

---

## 📋 Recommended AVD for React Native

**Create new AVD:**
- **Device:** Pixel 5 or Pixel 6
- **API:** 33 (Android 13) or 34 (Android 14)
- **RAM:** 4096 MB
- **Graphics:** Hardware - GLES 2.0
- **Storage:** 2048 MB

**Why:** Good balance of performance and compatibility

---

## 🎯 Next Steps

1. **Start emulator:**
   ```bash
   $ANDROID_HOME/emulator/emulator -avd flutter_emulator -gpu host &
   ```

2. **Start Expo:**
   ```bash
   npx expo start
   ```

3. **Press 'a'** when Metro starts

4. **Start developing!** 🚀

---

**You're all set! Use the emulator for much faster development.** ⚡
