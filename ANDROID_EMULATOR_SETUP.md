# 📱 Android Emulator Setup for Faster Development

## 🎯 Benefits of Using Android Emulator

✅ **Faster iteration** - No need to build APK for every change  
✅ **Hot reload** - Instant UI updates  
✅ **Better debugging** - Chrome DevTools, React Native Debugger  
✅ **Screen recording** - Easy to capture demos  
✅ **Multiple devices** - Test on different screen sizes  
✅ **No physical device needed** - Develop anywhere  

---

## 🚀 Quick Setup Guide

### Step 1: Create Android Virtual Device (AVD)

#### Option A: Using Android Studio GUI (Easiest)

1. **Open Android Studio**
2. **Click "More Actions"** → **"Virtual Device Manager"**
   - Or: Tools → Device Manager
3. **Click "Create Device"**
4. **Select Device:**
   - Recommended: **Pixel 5** or **Pixel 6**
   - Or choose based on your target audience
5. **Select System Image:**
   - Recommended: **API 33 (Android 13)** or **API 34 (Android 14)**
   - Click "Download" if not installed
6. **Click "Next"** → **"Finish"**

---

#### Option B: Using Command Line

```bash
# List available system images
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list | grep "system-images"

# Install system image (API 33)
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "system-images;android-33;google_apis;x86_64"

# Create AVD
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd \
  -n Pixel5_API33 \
  -k "system-images;android-33;google_apis;x86_64" \
  -d "pixel_5"
```

---

### Step 2: Start the Emulator

#### Option A: From Android Studio
1. **Open Device Manager**
2. **Click Play button** (▶️) next to your AVD
3. **Wait for emulator to boot** (first time takes 1-2 minutes)

#### Option B: From Command Line
```bash
# List available AVDs
$ANDROID_HOME/emulator/emulator -list-avds

# Start emulator (replace with your AVD name)
$ANDROID_HOME/emulator/emulator -avd Pixel5_API33 &

# Or start with specific options
$ANDROID_HOME/emulator/emulator -avd Pixel5_API33 -gpu host -no-snapshot-load &
```

**Options:**
- `-gpu host` - Use host GPU (faster)
- `-no-snapshot-load` - Fresh boot (slower but cleaner)
- `&` - Run in background

---

### Step 3: Verify Emulator is Connected

```bash
# Check if device is detected
adb devices

# Should show:
# List of devices attached
# emulator-5554    device
```

If you see `emulator-5554 device`, you're good to go! ✅

---

### Step 4: Run Expo on Emulator

#### Option A: Automatic (Recommended)

```bash
# Start Expo (will auto-detect emulator)
cd /Users/basith/Documents/whatsay-app-main
npx expo start

# Then press 'a' to open on Android emulator
# Or scan QR code with emulator
```

#### Option B: Manual

```bash
# 1. Start Metro bundler
npx expo start

# 2. In another terminal, run on Android
npx expo run:android

# Or use ADB to install
adb install path/to/app.apk
```

---

## ⚡ Optimize Emulator Performance

### 1. Enable Hardware Acceleration

**macOS:**
```bash
# Check if HAXM is available (Intel Macs)
# For Apple Silicon (M1/M2/M3): Use ARM64 system images
```

**Create AVD with better performance:**
- Use **x86_64** images (Intel Macs)
- Use **arm64-v8a** images (Apple Silicon Macs)
- Enable **Hardware - GLES 2.0** graphics

### 2. Allocate More RAM

In AVD settings:
- **RAM:** 2048 MB minimum (4096 MB recommended)
- **VM heap:** 512 MB
- **Internal Storage:** 2048 MB

### 3. Use Snapshots

- **Save snapshot** after first boot
- **Quick boot** uses snapshot (much faster)
- **Cold boot** for clean state

---

## 🎨 UI Development Workflow

### Fast Iteration Cycle

1. **Start emulator** (once per session)
2. **Start Expo:**
   ```bash
   npx expo start
   ```
3. **Press 'a'** to launch on emulator
4. **Edit code** → **Save** → **Auto-reloads** ✨
5. **See changes instantly** in emulator

### Hot Reload vs Fast Refresh

- **Fast Refresh:** Automatic (default)
- **Hot Reload:** Shake emulator → "Reload"
- **Full Reload:** `r` in Metro terminal

---

## 🐛 Debugging Tools

### 1. React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Open
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

**Features:**
- Redux DevTools
- React DevTools
- Network inspector
- Console logs

### 2. Chrome DevTools

1. **Shake emulator** (Cmd+M or Ctrl+M)
2. **Tap "Debug"**
3. **Chrome opens** → `chrome://inspect`
4. **Inspect elements, console, network**

### 3. Android Studio Logcat

```bash
# View logs
adb logcat | grep -i "whatsay\|expo\|react"

# Clear and view
adb logcat -c && adb logcat | grep -i "whatsay"
```

---

## 📱 Recommended AVD Configurations

### For UI Design

**Device:** Pixel 5 or Pixel 6  
**API:** 33 (Android 13)  
**RAM:** 4096 MB  
**Graphics:** Hardware - GLES 2.0  
**Storage:** 2048 MB  

### For Performance Testing

**Device:** Pixel 4 (older device)  
**API:** 30 (Android 11)  
**RAM:** 2048 MB  
**Graphics:** Automatic  

### For Different Screen Sizes

Create multiple AVDs:
- **Small:** Pixel 4 (5.7")
- **Medium:** Pixel 5 (6.0")
- **Large:** Pixel 7 Pro (6.7")
- **Tablet:** Pixel Tablet (10.95")

---

## 🔧 Troubleshooting

### Emulator Won't Start

```bash
# Kill existing emulator processes
pkill -9 qemu-system-x86_64
pkill -9 emulator

# Check if HAXM is installed (Intel Macs)
# For Apple Silicon: Use ARM64 images
```

### Emulator Too Slow

1. **Use ARM64 images** (Apple Silicon)
2. **Enable hardware acceleration**
3. **Increase RAM allocation**
4. **Close other apps**
5. **Use snapshots**

### Expo Can't Find Emulator

```bash
# Verify emulator is running
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Check connection
adb devices
```

### App Won't Install

```bash
# Uninstall existing app
adb uninstall com.safwanambat.whatsay

# Clear app data
adb shell pm clear com.safwanambat.whatsay

# Reinstall
npx expo run:android
```

---

## 🚀 Quick Start Commands

### Start Development Session

```bash
# Terminal 1: Start emulator
$ANDROID_HOME/emulator/emulator -avd Pixel5_API33 &

# Terminal 2: Start Expo
cd /Users/basith/Documents/whatsay-app-main
npx expo start

# Press 'a' when Metro starts
```

### Stop Everything

```bash
# Stop emulator
adb emu kill

# Stop Metro
pkill -f "expo start|metro"
```

---

## 💡 Pro Tips

1. **Keep emulator running** - Don't close between sessions
2. **Use snapshots** - Save state for faster boot
3. **Multiple emulators** - Test on different devices simultaneously
4. **Screen recording** - Built into emulator (Ctrl+S / Cmd+S)
5. **Keyboard shortcuts:**
   - `Ctrl+M` / `Cmd+M` - Open dev menu
   - `R` - Reload app
   - `D` - Open dev menu
   - `Ctrl+P` / `Cmd+P` - Toggle performance monitor

---

## 📋 Checklist

- [ ] Android Studio installed
- [ ] AVD created
- [ ] Emulator starts successfully
- [ ] `adb devices` shows emulator
- [ ] Expo can connect to emulator
- [ ] Hot reload works
- [ ] Debugging tools set up

---

**Ready to develop faster! Start your emulator and run `npx expo start`** 🚀
