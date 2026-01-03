# 🔐 How to Login to Expo/EAS

## 📍 Where to Login

**Login happens in your terminal** using the `eas login` command.

---

## 🚀 Step-by-Step Login

### Option 1: Interactive Login (Recommended)

**In your terminal, run:**
```bash
eas login
```

**What happens:**
1. Prompts: `Email or username:`
2. Enter your Expo account email/username
3. Prompts: `Password:`
4. Enter your password
5. ✅ Logged in!

**If you don't have an account:**
- The command will guide you to create one
- Or go to: https://expo.dev/signup

---

### Option 2: Browser Login

**In your terminal, run:**
```bash
eas login
```

**If browser opens:**
1. Login on the website
2. Authorize the CLI
3. ✅ Automatically logged in!

---

### Option 3: GitHub/Google Login

**In your terminal, run:**
```bash
eas login
```

**Then choose:**
- `GitHub` - Login with GitHub account
- `Google` - Login with Google account
- `Email` - Login with email/password

---

## 🎯 Quick Start

**Just run this in your terminal:**
```bash
eas login
```

**Then follow the prompts!**

---

## 📱 Create Account (If Needed)

If you don't have an Expo account:

1. **Via Terminal:**
   ```bash
   eas login
   # Choose "Create account" when prompted
   ```

2. **Via Website:**
   - Go to: https://expo.dev/signup
   - Create account (free)
   - Then run `eas login` in terminal

---

## ✅ Verify Login

**Check if you're logged in:**
```bash
eas whoami
```

**Should show:**
```
Logged in as: your-email@example.com
```

---

## 🔄 After Login

Once logged in, you can:
- ✅ Start builds: `eas build --platform android --profile androidapk`
- ✅ View builds: `eas build:list`
- ✅ Submit to stores: `eas submit`

---

## 💡 Where is "Login"?

**There's no separate login page** - it's all done in your terminal!

**Just run:**
```bash
eas login
```

**In your terminal, and follow the prompts!**

---

**Login happens in your terminal with `eas login`!** 🔐
