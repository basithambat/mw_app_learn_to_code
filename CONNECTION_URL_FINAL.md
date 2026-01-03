# 📱 Expo Connection URL

## ✅ Your Connection URL

```
exp://192.168.0.101:8081
```

---

## 🔗 How to Connect

### Method 1: Manual URL Entry (Recommended)

1. **Open Expo Go app** on your phone
2. **Tap "Enter URL manually"** (or "Connect to URL")
3. **Paste this URL**: `exp://192.168.0.101:8081`
4. **Tap "Connect"**
5. **Wait for app to load** (1-2 minutes for first build)

### Method 2: QR Code

1. **Start Expo** in your terminal:
   ```bash
   npx expo start --lan
   ```
2. **QR code will appear** in terminal
3. **Open Expo Go app**
4. **Scan the QR code**

---

## ⚙️ Start Expo Server

Run this in your terminal:

```bash
cd /Users/basith/Documents/whatsay-app-main
npx expo start --lan
```

**Or for tunnel mode** (works from anywhere):
```bash
npx expo start --tunnel
```
*(Will prompt to install @expo/ngrok - type 'y')*

---

## 📋 Requirements

- ✅ **Same WiFi**: Phone and computer on same network
- ✅ **Expo Go App**: Install from App Store/Play Store
- ✅ **Port 8081**: Should be accessible

---

## 🎯 Quick Connect

**Copy this URL:**
```
exp://192.168.0.101:8081
```

**Paste in Expo Go → Connect!**

---

## 💡 Troubleshooting

### If connection fails:
1. **Check WiFi**: Both devices on same network
2. **Check firewall**: Allow port 8081
3. **Try tunnel mode**: `npx expo start --tunnel`
4. **Check terminal**: Make sure Expo is running

---

**Your connection URL is ready!** 🚀

**URL**: `exp://192.168.0.101:8081`
