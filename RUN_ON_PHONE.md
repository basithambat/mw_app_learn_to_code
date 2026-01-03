# Running WhatSay App on Your Phone

## Option 1: Using Expo Go App (Easiest)

### Steps:
1. **Install Expo Go** on your phone:
   - iOS: Download from App Store
   - Android: Download from Google Play Store

2. **Start the server** (already running):
   ```bash
   npm start
   ```

3. **Scan QR Code**:
   - Open Expo Go app
   - Tap "Scan QR Code"
   - Scan the QR code shown in your terminal
   - The app will load on your phone!

### Note: This project uses dev-client, so you may need Option 2 instead.

---

## Option 2: Build Development Client (Recommended for this project)

Since this project uses `--dev-client`, you need to build a development build first.

### For Android:

1. **Connect your Android phone via USB**:
   ```bash
   # Enable USB debugging on your phone first
   adb devices  # Should show your device
   ```

2. **Build and install on phone**:
   ```bash
   npm run android
   ```
   This will:
   - Build the development client
   - Install it on your connected phone
   - Start the app

### For iOS:

1. **Connect your iPhone via USB**

2. **Build and install**:
   ```bash
   npm run ios
   ```
   This will:
   - Build the development client
   - Install it on your connected iPhone
   - Start the app

---

## Option 3: Using Tunnel Mode (For Remote Connection)

If your phone and computer are on different networks:

```bash
npx expo start --dev-client --tunnel
```

This creates a tunnel that allows your phone to connect from anywhere.

---

## Quick Commands

```bash
# Check connected devices
adb devices  # Android
xcrun simctl list devices  # iOS

# Run on Android phone
npm run android

# Run on iOS phone  
npm run ios

# Start with tunnel (for remote connection)
npx expo start --dev-client --tunnel
```

---

## Troubleshooting

### Android:
- Enable USB debugging in Developer Options
- Allow USB debugging when prompted
- Make sure `adb devices` shows your device

### iOS:
- Trust the computer on your iPhone
- Make sure Xcode is installed
- May need to configure signing in Xcode

### Connection Issues:
- Make sure phone and computer are on same WiFi (unless using tunnel)
- Try tunnel mode: `npx expo start --dev-client --tunnel`
- Check firewall settings

---

**The server is currently running. Check your terminal for the QR code or run the build commands above!**
