# 📱 Expo CLI Commands

## 🎯 Common Commands

### Start Development Server
```bash
npx expo start
```
Starts Metro bundler and shows QR code

```bash
npx expo start --clear
```
Starts with cleared cache

```bash
npx expo start --lan
```
Starts in LAN mode (for local network)

```bash
npx expo start --tunnel
```
Starts in tunnel mode (for remote access)

---

### Run on Device/Simulator
```bash
npx expo run:android
```
Builds and runs on Android device/emulator

```bash
npx expo run:ios
```
Builds and runs on iOS device/simulator

---

### Build Commands
```bash
npx expo prebuild
```
Generates native Android/iOS projects

```bash
npx expo prebuild --clean
```
Cleans and regenerates native projects

---

### Other Useful Commands
```bash
npx expo install [package]
```
Installs Expo-compatible package

```bash
npx expo config
```
Shows current Expo configuration

```bash
npx expo doctor
```
Checks for common issues

```bash
npx expo --version
```
Shows Expo CLI version

---

## 📋 Quick Reference

| Command | Purpose |
|---------|---------|
| `npx expo start` | Start dev server |
| `npx expo run:android` | Build & run Android |
| `npx expo run:ios` | Build & run iOS |
| `npx expo prebuild` | Generate native code |
| `npx expo install` | Install packages |
| `npx expo config` | Show config |
| `npx expo doctor` | Check issues |

---

## 🚀 Most Common

**Start development server:**
```bash
npx expo start
```

**Build and run on Android:**
```bash
npx expo run:android
```

**Build and run on iOS:**
```bash
npx expo run:ios
```

---

**Run `npx expo --help` to see all commands!** 📱
