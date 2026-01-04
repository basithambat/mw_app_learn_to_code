# 🚀 Quick Start Guide

## The Error You're Seeing

**"Connection refused"** means the backend API server is not running.

## Solution: Start the Backend

### Step 1: Start Database & Redis (if not running)

```bash
cd infra
docker-compose up -d postgres redis
```

### Step 2: Start the Backend API

Open a **new terminal window** and run:

```bash
cd apps/api
npm run start:dev
```

You should see:
```
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/docs
```

### Step 3: Verify Backend is Running

Test the API:
```bash
curl http://localhost:3000/api
```

Or open in browser: http://localhost:3000/docs

### Step 4: Try the App Again

Now go back to your Flutter app and try adding a spouse. It should work!

## Alternative: Use the Startup Script

```bash
cd apps/api
./start_backend.sh
```

## Troubleshooting

### If you see "Port 3000 already in use"

Kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

### If you see database connection errors

Make sure PostgreSQL is running:
```bash
docker-compose ps
```

### If IP address changed

Update `apps/mobile_web/lib/core/utils/api_client.dart`:
```dart
return 'http://YOUR_NEW_IP:3000/api';
```

Find your IP:
```bash
ipconfig getifaddr en0  # Mac
```

## Development Workflow

**Terminal 1** - Backend:
```bash
cd apps/api
npm run start:dev
```

**Terminal 2** - Flutter:
```bash
cd apps/mobile_web
flutter run
```

Both should be running simultaneously!
