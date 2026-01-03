# 🚀 Start Expo Manually - Interactive Mode

## ⚠️ Important

Metro bundler needs to be started **interactively** in your terminal to:
- Handle any prompts properly
- Show QR code clearly
- Display real-time logs
- Avoid CI mode issues

---

## 📝 Steps to Start

### 1. Open Your Terminal
Open a new terminal window in your project directory.

### 2. Navigate to Project
```bash
cd /Users/basith/Documents/whatsay-app-main
```

### 3. Kill Any Running Processes
```bash
pkill -9 -f expo
pkill -9 -f metro
```

### 4. Clear Caches
```bash
rm -rf .expo node_modules/.cache .metro
```

### 5. Start Expo (Interactive)
```bash
CI=0 npx expo start --clear --lan
```

**Important**: Run this command **directly in your terminal**, not through any script or background process.

---

## ⏱️ Wait for Build

**First build takes 2-3 minutes!**

Look for in terminal:
- ✅ "Starting Metro Bundler"
- ✅ "Metro waiting on http://localhost:8081"
- ✅ QR code appears
- ✅ "Logs for your project will appear below"

---

## 📱 Connect Your Device

### After Metro is Ready:

1. **Open Expo Go** on your phone
2. **Close and reopen** Expo Go (if it was already open)
3. **Connect using**:
   - **URL**: `exp://192.168.0.101:8081`
   - **Or scan QR code** from terminal

---

## 🔍 Verify Metro is Working

In a **separate terminal**, test:
```bash
curl http://localhost:8081/status
```

Should return: `packager-status:running`

---

## 💡 Why Manual Start?

- **Interactive prompts**: Expo may ask for login or confirmations
- **Real-time logs**: See errors immediately
- **QR code display**: Terminal shows QR code properly
- **No CI mode**: Interactive mode avoids CI restrictions

---

## 🎯 Expected Output

```
Starting project at /Users/basith/Documents/whatsay-app-main
Starting Metro Bundler
warning: Bundler cache is empty, rebuilding (this may take a minute)
Waiting on http://localhost:8081
Logs for your project will appear below.

[QR CODE HERE]

› Metro waiting on http://localhost:8081
```

---

**Start Expo in your terminal interactively for best results!** 🚀
