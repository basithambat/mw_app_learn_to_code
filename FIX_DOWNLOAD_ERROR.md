# 🔧 Fix: "Failed to download remote update" Error

## ❌ **Problem**
Expo Go shows: "Uncut error, Java.io.IOException: Failed to download remote update"

## 🔍 **Cause**
This happens when:
- Using `--dev-client` flag (requires custom dev build)
- Expo Go tries to download an update that doesn't exist
- Network connectivity issues

## ✅ **Solution**

### **Option 1: Use Regular Expo Go (Recommended)**

Start Expo without `--dev-client`:
```bash
npx expo start --clear
```

Then connect with:
- **QR Code** (scan from terminal or browser)
- **Manual URL**: `exp://192.168.0.101:8081`

### **Option 2: Use Tunnel Mode**

If WiFi is the issue:
```bash
npx expo start --tunnel
```

This uses Expo's servers and works from anywhere.

### **Option 3: Build Development Client**

If you need dev-client features:
```bash
npx expo run:android
# or
npx expo run:ios
```

This builds a custom app with dev-client built-in.

---

## 📱 **Current Setup**

I've started Expo in **regular mode** (without dev-client).

**To connect:**
1. Open Expo Go app
2. Scan QR code from terminal
3. Or enter: `exp://192.168.0.101:8081`

---

## 🔍 **If Still Not Working**

1. **Check Metro bundler is running:**
   ```bash
   lsof -ti:8081
   ```

2. **Check for errors in terminal:**
   - Look for red error messages
   - Check if bundle is compiling

3. **Try tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```

4. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

---

**Expo is now running in regular mode - try connecting again!** 🚀
