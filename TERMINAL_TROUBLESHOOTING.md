# 🔧 Terminal Troubleshooting Guide

## 🐛 **Common Terminal Issues**

### **Issue 1: Terminal Not Launching**
If VS Code terminal won't open:

1. **Check VS Code Settings:**
   - Open Settings (Cmd+,)
   - Search: "terminal.integrated.shell"
   - Make sure shell path is correct

2. **Try Manual Terminal:**
   - Open Terminal app (Mac) or Command Prompt (Windows)
   - Navigate to project: `cd /Users/basith/Documents/whatsay-app-main`
   - Run commands manually

3. **Restart VS Code:**
   - Sometimes a restart fixes terminal issues

### **Issue 2: Commands Not Found**
If you see "command not found":

1. **Check Node.js:**
   ```bash
   node --version
   npm --version
   ```

2. **Check PATH:**
   ```bash
   echo $PATH
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

### **Issue 3: Expo Not Starting**
If Expo dev server won't start:

1. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

2. **Kill existing processes:**
   ```bash
   # Kill Metro bundler
   lsof -ti:8081 | xargs kill -9
   
   # Kill Node processes
   pkill -f "expo"
   pkill -f "metro"
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 🚀 **Manual Start (If Terminal Issues)**

### **Option 1: Use System Terminal**
1. Open Terminal app (Mac) or Command Prompt (Windows)
2. Navigate to project:
   ```bash
   cd /Users/basith/Documents/whatsay-app-main
   ```
3. Start Expo:
   ```bash
   npm start
   ```

### **Option 2: Use Expo Go App Directly**
1. Make sure ingestion platform is running
2. Get your computer's IP: `192.168.0.101`
3. In Expo Go app, manually enter:
   ```
   exp://192.168.0.101:8081
   ```

### **Option 3: Use Tunnel Mode**
If WiFi issues:
```bash
npx expo start --tunnel
```
This uses Expo's servers (slower but works anywhere)

---

## 📱 **Alternative: Direct Device Connection**

If terminal/QR code doesn't work:

### **For Android:**
1. Connect device via USB
2. Enable USB debugging
3. Run: `npx expo run:android`

### **For iOS:**
1. Connect device via USB
2. Trust computer on device
3. Run: `npx expo run:ios`

---

## 🔍 **Check What's Running**

```bash
# Check if Expo is running
lsof -ti:8081

# Check if ingestion platform is running
lsof -ti:3000

# Check all Node processes
ps aux | grep node
```

---

## 💡 **Quick Fixes**

1. **Restart everything:**
   ```bash
   # Kill all Node processes
   pkill -f node
   
   # Start fresh
   cd /Users/basith/Documents/whatsay-app-main
   npm start
   ```

2. **Use different terminal:**
   - Try iTerm2 (Mac) or Windows Terminal
   - Or use VS Code's integrated terminal with different shell

3. **Check firewall:**
   - Make sure port 8081 and 3000 are not blocked
   - Mac: System Settings > Network > Firewall

---

## 📞 **Still Having Issues?**

1. Check VS Code terminal settings
2. Try system terminal instead
3. Use tunnel mode: `npx expo start --tunnel`
4. Or build directly: `npx expo run:android` or `npx expo run:ios`

---

**The Expo server is starting now. Check your terminal or browser for the QR code!** 🚀
