# 📊 Monitor Build Progress

## 🔍 Check Current Build Status

### Option 1: List Recent Builds
```bash
eas build:list --limit 5
```

Shows:
- Build ID
- Platform (android/ios)
- Status (in-progress, finished, errored)
- Created date
- Download link (when complete)

---

### Option 2: View Specific Build
```bash
eas build:view [BUILD_ID]
```

Replace `[BUILD_ID]` with the ID from the list above.

---

### Option 3: Watch Build in Real-Time
If you started a build, the terminal where you ran `eas build` will show:
- Upload progress
- Build progress
- Status updates
- Download link when complete

---

## 📱 Check Build Status Online

1. **Login to Expo Dashboard:**
   - Go to: https://expo.dev
   - Login with your Expo account

2. **View Your Project:**
   - Navigate to: Projects → whatsay → Builds
   - See all builds with status

3. **Monitor Progress:**
   - Real-time build logs
   - Status updates
   - Download links

---

## 🎯 Quick Commands

### Check if build is running:
```bash
eas build:list --limit 1
```

### View latest build details:
```bash
eas build:list --limit 1 --json
```

### Check your login status:
```bash
eas whoami
```

---

## 📋 Build Status Meanings

- **in-progress**: Build is currently running
- **finished**: Build completed successfully
- **errored**: Build failed (check logs)
- **canceled**: Build was canceled
- **new**: Build just started

---

## 💡 If No Build is Running

To start a new build:

```bash
# 1. Login (if not logged in)
eas login

# 2. Start build
eas build --platform android --profile androidapk
```

The terminal will show progress in real-time!

---

**Run `eas build:list` to see your build status!** 📊
