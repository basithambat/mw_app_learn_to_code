# 📊 Expo Error Monitoring Guide

## 🔍 **Ways to See Expo Errors**

### **1. Terminal Output (Real-time)**
The terminal where you run `npx expo start` shows all errors in real-time.

**Look for:**
- Red error messages
- Stack traces
- `ERROR` or `Error` keywords
- Exit codes (like `code: 137`)

### **2. Metro Bundler Logs**
Metro bundler shows compilation errors:

```bash
# View Metro logs
tail -f expo-output.log

# Or check terminal output directly
```

### **3. Device Logs (Android)**
```bash
# View device logs
adb logcat | grep -i "whatsay\|expo\|error"

# Clear and view fresh logs
adb logcat -c && adb logcat | grep -i "whatsay"
```

### **4. React Native Debugger**
1. Shake device (or Cmd+D on iOS simulator)
2. Tap "Debug Remote JS"
3. Opens Chrome DevTools with console errors

### **5. Expo Dev Tools**
Open in browser: `http://localhost:19002`
- Shows errors, logs, and device status

### **6. Error Log File**
Errors are now logged to: `expo-errors.log`

```bash
# View error log
tail -f expo-errors.log

# View all errors
cat expo-errors.log
```

---

## 🚨 **Error Code 137 Explained**

**Code 137 = Process Killed (OOM - Out of Memory)**

This means:
- Node.js process ran out of memory
- System killed it to prevent crash
- Usually happens during large bundle compilation

**Fixes:**
1. ✅ **Increase Node Memory Limit** (Already done)
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npx expo start
   ```

2. **Clear Caches**
   ```bash
   rm -rf .expo node_modules/.cache .metro
   ```

3. **Close Other Apps**
   - Free up system memory
   - Close heavy applications

4. **Restart Computer**
   - Clears memory leaks
   - Fresh start

---

## 🔧 **Current Setup**

I've configured:
- ✅ Increased Node memory to 4GB
- ✅ Error logging to `expo-errors.log`
- ✅ Real-time error monitoring
- ✅ Automatic cache clearing

---

## 📱 **View Errors on Device**

### **Android:**
```bash
# Real-time error stream
adb logcat -c && adb logcat | grep -E "ERROR|Error|whatsay|expo"
```

### **iOS Simulator:**
- Open Xcode
- Window > Devices and Simulators
- Select your simulator
- View Console logs

### **Physical iOS Device:**
- Connect via USB
- Open Xcode
- Window > Devices
- Select your device
- View Console logs

---

## 🎯 **Quick Error Check Commands**

```bash
# Check if Metro is running
lsof -ti:8081

# Check Expo status
curl http://localhost:8081/status

# View recent errors
tail -50 expo-output.log | grep -i error

# Check memory usage
ps aux | grep node | grep expo
```

---

## 💡 **Pro Tips**

1. **Keep Terminal Open**: Best way to see errors in real-time
2. **Use `--clear` Flag**: Clears cache and shows fresh errors
3. **Check Both Terminals**: Metro bundler AND device logs
4. **Error Log File**: Automatically saves all errors for later review

---

## 🆘 **If Errors Persist**

1. **Share Error Log:**
   ```bash
   cat expo-errors.log
   ```

2. **Share Terminal Output:**
   - Copy error messages from terminal
   - Include stack traces

3. **Check Memory:**
   ```bash
   # Check available memory
   vm_stat
   
   # Check Node memory
   node --max-old-space-size=4096 -e "console.log('Memory OK')"
   ```
