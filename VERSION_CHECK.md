# Version Check & Update Guide

## Current Version Status

### File Versions
- **app.json**: `1.0.4` ✅ (Source of truth for Expo)
- **package.json**: `1.0.0` (Not used by Expo)

### Platform Build Numbers
- **iOS Build Number**: `8`
- **Android Version Code**: `2`

---

## Why Expo Might Show 1.0.3

### Possible Reasons:
1. **Cached Version**: Expo may be showing a cached version
2. **Not Reloaded**: App hasn't been reloaded since version update
3. **Build Cache**: Metro bundler cache needs clearing

---

## How to Update Expo to Show 1.0.4

### Option 1: Reload App (Easiest)
1. Shake your device (or press `Cmd+D` on iOS simulator)
2. Tap "Reload"
3. Version should update to 1.0.4

### Option 2: Restart Expo Server
```bash
# Stop current Expo server (Ctrl+C)
# Then restart:
npx expo start --clear
```

### Option 3: Clear Cache and Restart
```bash
# Clear Metro bundler cache
npx expo start --clear

# Or clear all caches
rm -rf node_modules/.cache
npx expo start --clear
```

---

## Verify Version in App

The version can be checked in the app using:
```typescript
import Constants from 'expo-constants';
console.log('App Version:', Constants.expoConfig?.version);
```

---

## Summary

- **Actual Version**: `1.0.4` (in app.json)
- **Expo Showing**: `1.0.3` (likely cached)
- **Solution**: Reload app or restart Expo with `--clear` flag

**The version in app.json (1.0.4) is correct - Expo just needs to refresh!** ✅
