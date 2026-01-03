# 📱 How to Get the QR Code

## ❌ **Problem**
You're seeing the web app at `http://localhost:8081/discoverScreens` instead of the QR code.

## ✅ **Solution**

### **Method 1: Use Terminal Commands**

When Expo starts, you'll see options in the terminal:
- Press `s` - Switch to QR code view
- Press `a` - Open on Android
- Press `i` - Open on iOS
- Press `w` - Open in web (what you're seeing now)

**Steps:**
1. Look at the terminal where Expo is running
2. Press `s` to switch to QR code view
3. QR code will appear in terminal

### **Method 2: Start with QR Code Mode**

Stop current server and restart:
```bash
# Stop Expo
pkill -f expo

# Start with dev client (shows QR code)
npx expo start --dev-client
```

### **Method 3: Use Expo Go Directly**

If QR code still doesn't show:

1. **Get your computer's IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Your IP: `192.168.0.101`

2. **In Expo Go app:**
   - Open Expo Go
   - Tap "Enter URL manually"
   - Enter: `exp://192.168.0.101:8081`

### **Method 4: Use Tunnel Mode**

Works from anywhere:
```bash
npx expo start --tunnel
```
This gives you a URL like: `exp://u.expo.dev/...`
Enter this in Expo Go app.

---

## 🔍 **What You Should See**

When Expo starts correctly, you should see in terminal:
```
› Metro waiting on exp://192.168.0.101:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

And a large ASCII QR code in the terminal.

---

## 🎯 **Quick Fix**

1. **In the terminal where Expo is running:**
   - Press `s` (switch to QR code)
   - Or press `Ctrl+C` to stop, then restart with: `npx expo start --dev-client`

2. **Or use tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```
   Copy the URL shown and enter it in Expo Go.

---

**The Expo server is restarting now. Look for the QR code in the terminal!** 🚀
