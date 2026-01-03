# 📱 How to Start Android Emulator

## 🎯 Method 1: Android Studio Device Manager (Easiest)

### Step-by-Step:

1. **In Android Studio, look for "Device Manager"**
   - Usually at the **bottom** of the window
   - Or **right sidebar**
   - Or: **View** → **Tool Windows** → **Device Manager**

2. **Find your AVD:**
   - You should see `flutter_emulator` in the list
   - Or create a new one (see below)

3. **Click the Play button (▶️)** next to the AVD name

4. **Wait 30-60 seconds:**
   - Emulator window will appear
   - Android boot animation will show
   - Home screen loads

5. **Verify it's running:**
   - Device Manager shows "Running" status
   - Emulator window is visible on screen

---

## 🆕 Create New AVD (Recommended)

The `flutter_emulator` might have issues. Create a fresh one:

1. **In Device Manager:** Click **"Create Device"** button

2. **Select Hardware:**
   - Choose **Pixel 5** or **Pixel 6**
   - Click **"Next"**

3. **Select System Image:**
   - Choose **API 33 (Android 13)** or **API 34 (Android 14)**
   - If not installed, click **"Download"** (this takes a few minutes)
   - Click **"Next"**

4. **Verify Configuration:**
   - **AVD Name:** `Pixel5_API33` (or your choice)
   - **Graphics:** Hardware - GLES 2.0
   - Click **"Finish"**

5. **Start it:** Click Play button (▶️)

---

## 🚀 Method 2: Command Line

If Android Studio method doesn't work:

```bash
# List AVDs
$ANDROID_HOME/emulator/emulator -list-avds

# Start emulator (replace with your AVD name)
$ANDROID_HOME/emulator/emulator -avd flutter_emulator -gpu host

# Or create and start new one
# (Use Android Studio to create, then start from command line)
```

---

## ✅ Once Emulator is Running

1. **Check it's connected:**
   ```bash
   adb devices
   # Should show: emulator-5554    device
   ```

2. **Start Expo:**
   ```bash
   npx expo start
   ```

3. **Press 'a'** when Metro shows QR code

---

## 🐛 Troubleshooting

### Can't Find Device Manager

**In Android Studio:**
- **View** → **Tool Windows** → **Device Manager**
- Or look for tabs at bottom: "Device Manager", "Logcat", etc.

### AVD Won't Start

1. **Check system requirements:**
   - RAM: 4GB+ available
   - Disk space: 2GB+ free

2. **Try different graphics:**
   - Edit AVD → Advanced Settings
   - Graphics: Try "Software - GLES 2.0"

3. **Create new AVD:**
   - Delete old one
   - Create fresh AVD (see above)

### Emulator Window Doesn't Appear

1. **Check if process is running:**
   ```bash
   ps aux | grep emulator
   ```

2. **Check logs:**
   - Android Studio → View → Tool Windows → Logcat

3. **Try starting from command line:**
   ```bash
   $ANDROID_HOME/emulator/emulator -avd YOUR_AVD_NAME -gpu host
   ```

---

## 💡 Quick Start Checklist

- [ ] Open Android Studio
- [ ] Open Device Manager
- [ ] Find or create AVD
- [ ] Click Play button (▶️)
- [ ] Wait for emulator to boot
- [ ] Verify `adb devices` shows emulator
- [ ] Run `npx expo start`
- [ ] Press 'a' to launch app

---

**Start from Android Studio Device Manager - it's the most reliable way!** 🚀
