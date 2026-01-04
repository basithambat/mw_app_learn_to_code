# API Connection Setup Guide

## Problem: Connection Refused Error

When running the Flutter app on a physical device, you may encounter:
```
DioException: Connection refused
Address: localhost
Port: 45186
```

This happens because `localhost` on a physical device refers to the device itself, not your development computer.

## Solution

### Step 1: Find Your Computer's IP Address

**On macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```cmd
ipconfig
```

Look for your local network IP (usually starts with `192.168.x.x` or `10.0.x.x`).

### Step 2: Update API Client

The API client in `apps/mobile_web/lib/core/utils/api_client.dart` is configured to:
- Use `localhost:3000` for web builds
- Use `192.168.0.101:3000` for mobile builds (update this to your IP)

**Current Configuration:**
```dart
static String get baseUrl {
  if (kIsWeb) {
    return 'http://localhost:3000/api';
  } else {
    // Update this IP to match your computer's local IP
    return 'http://192.168.0.101:3000/api';
  }
}
```

**To Update:**
1. Find your computer's IP address (see Step 1)
2. Update the IP in `api_client.dart` (line ~30)
3. Rebuild the app

### Step 3: Update Backend CORS (if needed)

The backend CORS is configured in `apps/api/src/main.ts` to allow requests from:
- `http://localhost:3000`
- `http://localhost:8080`
- `http://192.168.0.101:3000` (your local IP)

If your IP is different, update the CORS origins in `main.ts`.

### Step 4: Restart Backend (if CORS was updated)

If you updated CORS configuration:
```bash
cd apps/api
npm run start:dev
```

### Step 5: Rebuild Flutter App

After updating the IP address:
```bash
cd apps/mobile_web
flutter clean
flutter pub get
flutter run -d <device-id>
```

## Testing

1. **Verify Backend is Running:**
   ```bash
   curl http://localhost:3000/api/auth/otp/send \
     -H "Content-Type: application/json" \
     -d '{"phone":"+91704206330"}'
   ```

2. **Test from Device IP:**
   ```bash
   curl http://192.168.0.101:3000/api/auth/otp/send \
     -H "Content-Type: application/json" \
     -d '{"phone":"+91704206330"}'
   ```

3. **Check Device and Computer are on Same Network:**
   - Both device and computer must be on the same Wi-Fi network
   - Firewall should allow connections on port 3000

## Troubleshooting

### Still Getting Connection Refused?

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:3000/api/auth/otp/send
   ```

2. **Check IP Address is Correct:**
   - Verify your computer's IP hasn't changed
   - Some networks assign dynamic IPs

3. **Check Firewall:**
   - macOS: System Preferences → Security & Privacy → Firewall
   - Allow connections on port 3000

4. **Check Network:**
   - Device and computer must be on same Wi-Fi
   - Some corporate networks block device-to-device connections

### Alternative: Use ngrok for Testing

For easier testing, you can use ngrok to expose your local server:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Expose local port
ngrok http 3000

# Use the ngrok URL in api_client.dart
# e.g., https://abc123.ngrok.io/api
```

## Current Configuration

- **Computer IP**: `192.168.0.101`
- **Backend Port**: `3000`
- **API Base URL (Mobile)**: `http://192.168.0.101:3000/api`
- **API Base URL (Web)**: `http://localhost:3000/api`

## Notes

- The IP address may change if you reconnect to Wi-Fi
- For production, use environment variables or a configuration file
- Consider using a service discovery mechanism for development
