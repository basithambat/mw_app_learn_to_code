# EAS Build Instructions

## Quick Start

To build your app with the latest Supabase integration:

### Step 1: Login to EAS
```bash
eas login
```
Enter your Expo account credentials when prompted.

### Step 2: Start the Build
```bash
# For Android
eas build --platform android --profile production

# For iOS  
eas build --platform ios --profile production

# For both platforms
eas build --platform all --profile production
```

## Current Build Configuration

- **App Version**: 1.0.4
- **iOS Build Number**: 8
- **Android Version Code**: 2
- **Profile**: production

## Alternative: Using Access Token (for CI/CD)

If you have an Expo access token, you can set it as an environment variable:

```bash
export EXPO_TOKEN=your_access_token_here
eas build --platform android --profile production
```

## Monitor Your Build

Once the build starts, you'll get a URL to monitor progress. You can also check:
- https://expo.dev/accounts/[your-account]/projects/whatsay/builds

## What's New in This Build

✅ Supabase integration (project: rnvngxfpbxvnajownetj)
✅ All API calls now use Supabase directly
✅ Updated version numbers
