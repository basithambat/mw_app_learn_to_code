# Expo Tunnel Mode - Connection Information

## ✅ Setup Status

- **@expo/ngrok**: Installed globally ✅
- **Expo Tunnel**: Starting...

---

## 📱 How to Get Connection URL

### Check Your Terminal Window

The tunnel URL will appear in your terminal. Look for:

1. **QR Code** - Visual code you can scan
2. **Connection URL** - Format: `exp://xxxxx.anonymous.exp.direct:80`
3. **Metro Status** - "Metro waiting on..." message

---

## 🔗 Manual Connection Steps

### If URL Appears in Terminal:

1. **Copy the URL** (starts with `exp://`)
2. **Open Expo Go app** on your phone
3. **Tap "Enter URL manually"**
4. **Paste the URL**
5. **Tap "Connect"**

### If QR Code Appears:

1. **Open Expo Go app**
2. **Tap "Scan QR code"**
3. **Scan the code from terminal**
4. **App will load automatically**

---

## ⏱️ Expected Timeline

- **Tunnel Setup**: 30-60 seconds
- **Metro Bundler**: 10-20 seconds
- **Total**: ~1-2 minutes for first connection

---

## 🎯 Alternative: Use LAN Mode

If tunnel is taking too long, try LAN mode:

```bash
npx expo start --lan
```

Then use: `exp://192.168.0.101:8081`

---

## 📋 Current Status

- **Mode**: Tunnel
- **Package**: @expo/ngrok installed
- **Status**: Starting...
- **Check**: Your terminal window for URL/QR code

---

**The tunnel URL will appear in your terminal window shortly!** 🚀

Check the terminal where Expo is running for the connection details.
