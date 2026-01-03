# ⚡ Quick Emulator Start Guide

## 🚀 Fastest Way to Start

### 1. Create AVD (One-time setup)

**In Android Studio:**
1. Open Android Studio
2. **More Actions** → **Virtual Device Manager**
3. **Create Device** → **Pixel 5** → **API 33** → **Finish**

---

### 2. Start Emulator

**Option A: From Android Studio**
- Device Manager → Click **Play** (▶️) button

**Option B: Command Line**
```bash
# List AVDs
$ANDROID_HOME/emulator/emulator -list-avds

# Start (replace with your AVD name)
$ANDROID_HOME/emulator/emulator -avd Pixel5_API33 &
```

---

### 3. Run Expo

```bash
cd /Users/basith/Documents/whatsay-app-main
npx expo start

# When Metro starts, press 'a' to open on Android
```

---

## ✅ Verify It Works

```bash
# Check emulator is connected
adb devices

# Should show: emulator-5554    device
```

---

## 🎨 Development Workflow

1. **Start emulator** (once)
2. **Run `npx expo start`**
3. **Press 'a'** to launch
4. **Edit code** → **Auto-reloads** ✨
5. **See changes instantly!**

---

**That's it! Much faster than building APK every time.** 🚀
