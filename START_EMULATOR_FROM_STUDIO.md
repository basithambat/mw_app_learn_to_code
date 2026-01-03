# 📱 Start Emulator from Android Studio

## 🎯 Easiest Way: Use Android Studio GUI

### Step 1: Open Device Manager

**In Android Studio:**
1. Look for **"Device Manager"** tab (usually at bottom or right side)
2. **Or:** Click **"More Actions"** (three dots) → **"Virtual Device Manager"**
3. **Or:** Go to **Tools** → **Device Manager**

---

### Step 2: Start Emulator

1. **Find your AVD** in the list:
   - You should see `flutter_emulator`
   - Or create a new one (see below)

2. **Click the Play button (▶️)** next to the AVD name

3. **Wait for emulator to boot:**
   - First boot: 30-60 seconds
   - You'll see Android boot animation
   - Emulator window will appear

---

### Step 3: Verify It's Running

**In Android Studio:**
- Device Manager shows "Running" status
- Emulator window is visible

**Or check in terminal:**
```bash
adb devices
# Should show: emulator-5554    device
```

---

## 🆕 Create New AVD (If Needed)

If `flutter_emulator` doesn't work or you want a new one:

1. **In Device Manager:** Click **"Create Device"**

2. **Select Device:**
   - Recommended: **Pixel 5** or **Pixel 6**
   - Click **"Next"**

3. **Select System Image:**
   - Recommended: **API 33 (Android 13)** or **API 34 (Android 14)**
   - If not installed, click **"Download"**
   - Wait for download
   - Click **"Next"**

4. **Configure AVD:**
   - **AVD Name:** `Pixel5_API33` (or your choice)
   - **Graphics:** Hardware - GLES 2.0 (for better performance)
   - Click **"Finish"**

5. **Start it:** Click Play button (▶️)

---

## 🚀 Alternative: Command Line

If Android Studio method doesn't work:

```bash
# List available AVDs
$ANDROID_HOME/emulator/emulator -list-avds

# Start emulator
$ANDROID_HOME/emulator/emulator -avd flutter_emulator -gpu host &

# Check status
adb devices
```

---

## ✅ Once Emulator is Running

1. **Emulator window appears** ✅
2. **Android home screen loads** ✅
3. **Run Expo:**
   ```bash
   npx expo start
   ```
4. **Press 'a'** when Metro starts

---

## 🐛 Troubleshooting

### Emulator Won't Start from Android Studio

1. **Check AVD exists:**
   - Device Manager should show your AVD
   - If not, create one (see above)

2. **Check system requirements:**
   - Enough RAM (4GB+ recommended)
   - HAXM installed (Intel Macs)
   - For Apple Silicon: Use ARM64 images

3. **Try command line:**
   ```bash
   $ANDROID_HOME/emulator/emulator -avd flutter_emulator -gpu host
   ```

### Emulator Starts But Crashes

1. **Increase RAM:**
   - Edit AVD → Advanced Settings → RAM: 4096 MB

2. **Use different graphics:**
   - Try "Software - GLES 2.0" instead of "Hardware"

3. **Check logs:**
   - Android Studio → View → Tool Windows → Logcat

---

## 💡 Pro Tip

**Keep emulator running** between development sessions:
- Don't close emulator window
- Just close Android Studio if needed
- Emulator stays running in background
- Much faster to resume development!

---

**Start the emulator from Android Studio Device Manager, then run `npx expo start`!** 🚀
