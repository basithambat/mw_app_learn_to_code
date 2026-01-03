# Fix: "Failed to download remote update" Error

## 🔍 Root Cause

**Error**: `Java.io.IOException: Failed to download remote update`

**Cause**: Metro bundler (Expo's JavaScript bundler) is not running or not accessible.

---

## ✅ Solution

### Step 1: Start Expo Server

Run this in your terminal:

```bash
cd /Users/basith/Documents/whatsay-app-main
npx expo start --clear --lan
```

**Wait for:**
- "Metro waiting on http://localhost:8081"
- QR code to appear
- Connection URL shown

### Step 2: Verify Metro is Running

Check that Metro bundler is accessible:
```bash
curl http://localhost:8081/status
```

Should return: `packager-status:running`

### Step 3: Reconnect App

1. **Close Expo Go app completely** (swipe away)
2. **Reopen Expo Go app**
3. **Connect using**: `exp://192.168.0.101:8081`
4. **Or scan QR code** from terminal

---

## 🔧 Alternative: Tunnel Mode

If LAN mode doesn't work, use tunnel:

```bash
npx expo start --tunnel --clear
```

When prompted to install `@expo/ngrok`, type `y`.

---

## 📋 Checklist

- [ ] Expo server is running (check terminal)
- [ ] Metro bundler is accessible (port 8081)
- [ ] Phone and computer on same WiFi
- [ ] Expo Go app is closed and reopened
- [ ] Using correct connection URL

---

## 🎯 Quick Fix Command

```bash
cd /Users/basith/Documents/whatsay-app-main
pkill -f expo
rm -rf .expo node_modules/.cache
npx expo start --clear --lan
```

Then connect using: `exp://192.168.0.101:8081`

---

## 💡 Why This Happens

- Metro bundler stopped/crashed
- Cache corruption
- Network connectivity issue
- Expo server not started

**Solution**: Always ensure Expo is running before connecting the app!

---

**The error means Metro bundler isn't running. Start Expo and the error will be fixed!** ✅
