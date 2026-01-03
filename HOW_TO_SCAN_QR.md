# 📱 How to Scan Expo QR Code

## 🚀 **Starting the Dev Server**

The Expo dev server is starting. Once it's ready, you'll see:

1. **QR Code in Terminal** - ASCII art QR code
2. **Expo DevTools** - Opens in browser at `http://localhost:8081`
3. **Metro Bundler** - Shows QR code and connection info

---

## 📲 **Where to Find the QR Code**

### **Option 1: Terminal**
- Look at the terminal where you ran `npm start`
- You'll see a large ASCII QR code
- This is the easiest to scan

### **Option 2: Browser (Expo DevTools)**
- Expo DevTools opens automatically
- URL: `http://localhost:8081`
- QR code is displayed at the top
- More reliable for scanning

### **Option 3: Metro Bundler**
- The Metro bundler output shows connection info
- QR code is displayed there too

---

## 📱 **How to Scan (iOS)**

1. **Open Camera app** on your iPhone/iPad
2. **Point camera** at the QR code (terminal or browser)
3. **Tap the notification** that appears at the top
4. **Opens in Expo Go** automatically

**Note:** iOS 11+ has built-in QR scanning in Camera app

---

## 🤖 **How to Scan (Android)**

1. **Install Expo Go** from Google Play Store
   - Search: "Expo Go"
   - Install the official app

2. **Open Expo Go app**

3. **Tap "Scan QR code"** button

4. **Point camera** at the QR code

5. **App loads** automatically

---

## ⚠️ **Important Requirements**

### **Same WiFi Network**
- Your phone and computer must be on the **same WiFi network**
- If not, the app won't connect

### **Firewall**
- Make sure your firewall allows connections on port 8081
- Mac: System Settings > Network > Firewall

### **Network Access**
- Some corporate/school networks block this
- Try using your phone's hotspot if it doesn't work

---

## 🔧 **Troubleshooting**

### **QR Code Not Scanning**
- Make sure phone and computer are on same WiFi
- Try scanning from browser (Expo DevTools) instead of terminal
- Check firewall settings

### **Connection Failed**
- Verify Expo dev server is running
- Check your computer's IP address
- Try: `npx expo start --tunnel` (uses Expo's servers)

### **App Not Loading**
- Make sure ingestion platform is running on port 3000
- Check API URL in `api/apiIngestion.ts`
- For physical device, use your computer's IP: `192.168.0.101:3000`

---

## 🎯 **Quick Start**

1. **Start dev server:**
   ```bash
   npm start
   ```

2. **Look for QR code** in terminal or browser

3. **Scan with phone:**
   - iOS: Camera app
   - Android: Expo Go app

4. **App loads** on your device!

---

## 💡 **Pro Tips**

- **Use browser QR code** - More reliable than terminal ASCII
- **Keep terminal visible** - Shows connection status
- **Use tunnel mode** if WiFi doesn't work: `npx expo start --tunnel`
- **Check network** - Same WiFi is critical

---

**The dev server is starting now. Look for the QR code in a few seconds!** 🚀
