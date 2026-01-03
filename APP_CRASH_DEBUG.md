# 🔍 Debugging App Crash

## 📱 Issue
App is installed but not running when opened.

## 🔍 Checking
1. ✅ App installation status
2. ✅ Crash logs
3. ✅ Error messages
4. ✅ Launch activity

---

## 📊 Current Status
Checking logs and app status...

---

## 🔧 Common Causes

### 1. Missing Google Services
- We disabled Google Services plugin for build
- App might need it at runtime
- **Fix**: Add valid google-services.json

### 2. Firebase Configuration
- Firebase might not be initialized
- Missing configuration files
- **Fix**: Add proper Firebase config

### 3. Network Issues
- API endpoints not accessible
- Backend not running
- **Fix**: Check backend connection

### 4. Missing Permissions
- App needs permissions
- Not granted at runtime
- **Fix**: Grant permissions

---

## 🔍 What I'm Checking

1. **Crash logs** - See what error occurs
2. **App status** - Verify installation
3. **Launch activity** - Check entry point
4. **Error messages** - Identify root cause

---

**Checking logs now...** 🔍
