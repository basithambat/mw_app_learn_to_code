# Expo Connection URL

## 🔗 Connection Methods

### Method 1: Direct URL (Local Network)
```
exp://YOUR_LOCAL_IP:8081
```

**To find your local IP:**
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Or check: System Preferences → Network

**Example:**
```
exp://192.168.1.100:8081
```

### Method 2: Tunnel (Recommended if 137 error)
```bash
npx expo start --tunnel
```

This uses Expo's servers and doesn't require local network connection.

### Method 3: LAN
```bash
npx expo start --lan
```

### Method 4: Web Browser
```
http://localhost:8081
```

---

## 🐛 Fixing Exit Code 137 (Memory Issue)

Exit code 137 = Process killed (usually out of memory)

### Solutions:

1. **Use Tunnel Mode** (Easiest)
   ```bash
   npx expo start --tunnel
   ```
   - Uses Expo's servers
   - No local network needed
   - Less memory intensive

2. **Close Other Apps**
   - Close memory-intensive apps
   - Free up RAM

3. **Restart Terminal**
   - Close and reopen terminal
   - Try again

4. **Increase Node Memory** (if needed)
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npx expo start
   ```

---

## 📱 How to Connect

### Using Expo Go App:
1. Open **Expo Go** app
2. Tap **"Enter URL manually"**
3. Enter: `exp://YOUR_IP:8081` or use tunnel URL
4. Tap **"Connect"**

### Using QR Code:
1. Check terminal for QR code
2. Scan with Expo Go app
3. App will load automatically

---

## 🎯 Quick Start

**If getting 137 error, use tunnel:**
```bash
cd /Users/basith/Documents/whatsay-app-main
npx expo start --tunnel
```

Then scan the QR code or use the URL shown in terminal.

---

**The tunnel method is most reliable and avoids memory issues!** 🚀
