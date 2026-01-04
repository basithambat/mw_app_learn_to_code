# Backend Startup Guide

## Quick Start

The backend server must be running for the Flutter app to work with real API calls.

### Option 1: Using the Startup Script (Recommended)

```bash
cd apps/api
./start_backend.sh
```

### Option 2: Manual Start

```bash
cd apps/api
npm run start:dev
```

## Prerequisites

1. **Database (PostgreSQL)**: Must be running
   ```bash
   # Using Docker Compose (recommended)
   cd infra
   docker-compose up -d postgres redis
   ```

2. **Redis**: Required for OTP storage
   ```bash
   # Already included in docker-compose
   ```

3. **Environment Variables**: `.env` file in `apps/api/`
   ```bash
   # Copy from example if needed
   cp ../infra/env.example .env
   ```

## Verify Backend is Running

1. Check if server is listening on port 3000:
   ```bash
   lsof -i :3000
   ```

2. Test the API:
   ```bash
   curl http://localhost:3000/api
   ```

3. Check API docs:
   Open browser: http://localhost:3000/docs

## Common Issues

### Connection Refused Error

**Problem**: Flutter app shows "Connection refused" error

**Solution**:
1. Make sure backend is running: `cd apps/api && npm run start:dev`
2. Check your computer's IP address matches Flutter config:
   ```bash
   # Get your IP
   ipconfig getifaddr en0  # Mac
   # or
   ipconfig getifaddr en1  # Mac alternative
   ```
3. Update `apps/mobile_web/lib/core/utils/api_client.dart` if IP changed:
   ```dart
   return 'http://YOUR_IP_HERE:3000/api';
   ```

### Port Already in Use

**Problem**: Error "Port 3000 is already in use"

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Database Connection Error

**Problem**: Backend can't connect to PostgreSQL

**Solution**:
1. Make sure PostgreSQL is running:
   ```bash
   docker-compose ps  # Check if postgres is up
   ```
2. Check DATABASE_URL in `.env` file
3. Run migrations:
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```

## Development Workflow

1. **Start Infrastructure** (first time only):
   ```bash
   cd infra
   docker-compose up -d
   ```

2. **Start Backend**:
   ```bash
   cd apps/api
   ./start_backend.sh
   ```

3. **Start Flutter App**:
   ```bash
   cd apps/mobile_web
   flutter run
   ```

## Mock Login Endpoint

The backend includes a development endpoint for mock login:

**Endpoint**: `POST /api/auth/dev/mock-login`

**Request**:
```json
{
  "phone": "7042063370",
  "otp": "278823"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "phone": "7042063370"
  }
}
```

**Note**: Only works in development mode (NODE_ENV !== 'production')
