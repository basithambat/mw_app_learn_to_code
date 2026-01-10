# 🤖 Coding Agent Context & Setup Guide

**This document provides essential context for a coding agent to work effectively on this project.**

---

## 📍 CRITICAL: Project Location

**⚠️ ABSOLUTE PATH - USE THIS FOR ALL FILE OPERATIONS:**
```
/Users/basith/Documents/whatsay-app-main
```

**Always use absolute paths when referencing files in this project.**

---

## 🛑 STANDING INSTRUCTIONS (COST & ARCHITECTURE)

**1. Cost Impact Checks**
> [!IMPORTANT]
> **ANY change that adds resources, processes, or external calls MUST be evaluated for cost increases.**
> - **Before proceeding**, you MUST inform the user if a change (e.g., adding workers, new cloud services, frequent polling) increases cloud costs.
> - **Confirm** with the user before implementing "always-on" or "auto-scaling" features.

**2. Backend Architecture Rule**
> The backend follows a **Producer-Consumer** pattern.
> - **API (Producer)**: Runs on port 3002. Handles HTTP requests.
> - **Worker (Consumer)**: Runs separately. Processes background jobs (Ingestion).
> - **Local Dev**: ALWAYS run both. Use `npm run dev:all` in `ingestion-platform`.

---

## 🎯 Project Overview

**WhatSay App** is a React Native news aggregation platform with:
- News feed with daily editions and explore sections
- Reddit-like commenting system with personas
- Firebase authentication (Phone OTP + Google Sign-In)
- Node.js backend API for content ingestion
- Deployed on Google Cloud Platform (Mumbai region)

---

## 🏗️ Technology Stack

### Frontend (React Native)
- **Framework:** React Native 0.74.5
- **Platform:** Expo ~51.0.39 (Managed Workflow)
- **Navigation:** Expo Router ~3.5.24 (File-based routing)
- **State Management:** Redux Toolkit ^2.3.0
- **Authentication:** React Native Firebase ^21.6.0
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)

### Backend (Node.js)
- **Runtime:** Node.js 20+
- **Framework:** Fastify
- **Database:** PostgreSQL (Cloud SQL on GCP)
- **ORM:** Prisma
- **Cache:** Redis (Memorystore on GCP)
- **Queue:** BullMQ
- **Storage:** Google Cloud Storage (S3-compatible)
- **Language:** TypeScript

### Infrastructure
- **Cloud Provider:** Google Cloud Platform
- **Project ID:** `gen-lang-client-0803362165`
- **Region:** `asia-south1` (Mumbai, India)
- **API Deployment:** Cloud Run
- **Database:** Cloud SQL (PostgreSQL)
- **Cache:** Memorystore (Redis)

### Third-Party Services
- **Firebase:** Authentication and user management
- **Firecrawl:** Optional web scraping (paid)
- **LLM APIs:** Google Gemini (primary), Mistral/OpenAI (optional)

---

## 📂 Project Structure

```
/Users/basith/Documents/whatsay-app-main/
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Home screen
│   └── (tabs)/                  # Tab navigation screens
│
├── components/                   # React Native components
│   ├── CardAnimation.tsx        # Card animations
│   ├── DiscoverScreen/          # Discover screen components
│   ├── ExpandNewsItem.tsx       # News item expansion
│   ├── PersonaSelector.tsx      # Persona selection UI
│   └── comment/                 # Comment system components
│
├── api/                         # API client code
│   ├── apiIngestion.ts          # Backend API client
│   └── apiComments.ts           # Comment API client
│
├── redux/                       # Redux state management
│   └── slice/
│       └── articlesComments.ts  # Comment state slice
│
├── hooks/                       # Custom React hooks
│   ├── useAnimations.ts         # Animation hooks
│   └── useCombined.ts           # Combined hooks
│
├── ingestion-platform/          # Backend API server
│   ├── src/
│   │   ├── index.ts            # API server entry point
│   │   ├── config/             # Configuration
│   │   │   ├── env.ts         # Environment variables
│   │   │   ├── s3.ts          # S3/Storage config
│   │   │   └── firebase-admin.ts  # Firebase Admin SDK
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth, rate limiting
│   │   ├── ingestion/         # Content ingestion
│   │   └── media/             # Media handling
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── Dockerfile              # Docker configuration
│   ├── cloudbuild.yaml         # GCP Cloud Build config
│   └── package.json            # Backend dependencies
│
├── android/                     # Android native code
│   └── app/
│       ├── build.gradle        # Android build config
│       ├── google-services.json  # Firebase config
│       └── src/main/
│           ├── AndroidManifest.xml
│           └── java/com/safwanambat/whatsay/
│
├── ios/                         # iOS native code
│   └── GoogleService-Info.plist  # Firebase config
│
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build configuration
├── package.json                 # Frontend dependencies
└── CREDENTIALS_AND_CONFIG.md    # All credentials (READ THIS FIRST)
```

---

## 🔑 Key Configuration Files

### Frontend
- **`app.json`** - Expo app configuration (name, version, bundle IDs, etc.)
- **`eas.json`** - EAS Build profiles and Apple Developer credentials
- **`package.json`** - Frontend dependencies and scripts
- **`api/apiIngestion.ts`** - Backend API base URL configuration

### Backend
- **`ingestion-platform/src/config/env.ts`** - Environment variable schema
- **`ingestion-platform/env.example`** - Example environment variables
- **`ingestion-platform/prisma/schema.prisma`** - Database schema
- **`ingestion-platform/Dockerfile`** - Docker build configuration
- **`ingestion-platform/cloudbuild.yaml`** - GCP Cloud Build configuration

### Android
- **`android/app/build.gradle`** - Android build configuration
- **`android/app/google-services.json`** - Firebase Android config
- **`android/app/src/main/AndroidManifest.xml`** - Android manifest

### iOS
- **`ios/GoogleService-Info.plist`** - Firebase iOS config

---

## 🚀 Development Workflow

### Starting Development

1. **Navigate to project:**
   ```bash
   cd /Users/basith/Documents/whatsay-app-main
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ingestion-platform
   npm install
   cd ..
   ```

4. **Set up environment variables:**
   - Copy `ingestion-platform/env.example` to `ingestion-platform/.env`
   - Fill in values (see `CREDENTIALS_AND_CONFIG.md`)

5. **Start backend (API + Worker):**
   ```bash
   cd ingestion-platform
   npm run dev:all
   # Runs API on http://localhost:3002 AND Worker process concurrently
   # Logs for both will appear in the same terminal
   ```

6. **Start frontend:**
   ```bash
   npx expo start
   # Metro bundler runs on http://localhost:8081
   ```

### Database Migrations

```bash
cd ingestion-platform
npx prisma migrate dev
```

### Building for Production

**Android APK:**
```bash
eas build --platform android --profile androidapk
```

**Android App Bundle (Play Store):**
```bash
eas build --platform android --profile production
```

**iOS:**
```bash
eas build --platform ios --profile production
```

---

## 🌐 API Endpoints

### Backend API Base URLs
- **Production (Current):** `https://whatsay-api-278662370606.asia-south1.run.app`
- **Production (Previous):** `https://whatsay-api-jsewdobsva-el.a.run.app`
- **Local (Emulator):** `http://localhost:3000`
- **Local (Physical Device):** `http://192.168.0.101:3000` (update IP if changed)

**Note:** The frontend code in `api/apiIngestion.ts` currently uses `https://whatsay-api-jsewdobsva-el.a.run.app` but should be updated to the current production URL.

### Complete API Endpoints

#### Public Endpoints
- `GET /health` - Health check (includes database connectivity check)
- `GET /api/sources` - List all available content sources and categories
- `GET /api/feed` - Get news feed with pagination
  - Query params: `?source=inshorts&category=technology&limit=25&cursor=...`
- `GET /api/feed/:sourceId` - Get feed for specific source

#### Content Ingestion
- `POST /api/jobs/run` - Trigger content ingestion job
  - Body: `{"sourceId": "inshorts", "category": "technology"}`
- `GET /api/jobs/:runId` - Get ingestion job status

#### User Profile (v2 API)
- `GET /v2/user/profile` - Get user profile and preferences
- `PUT /v2/user/profile` - Update user profile
- `POST /v2/user/profile/picture` - Upload profile picture

#### Editions & Explore
- `GET /api/editions/today` - Get today's edition
- `GET /api/editions/:editionId` - Get specific edition
- `GET /api/explore` - Get explore sections
- `GET /api/explore/:category` - Get explore items for category

#### Comments (Requires Authentication)
- `POST /api/comments` - Create a new comment
- `GET /api/comments/:articleId` - Get comments for an article
- `PUT /api/comments/:id` - Edit a comment
- `DELETE /api/comments/:id` - Delete a comment
- `POST /api/comments/:id/vote` - Vote on a comment (upvote/downvote)
- `POST /api/comments/:id/report` - Report a comment
- `POST /api/users/:userId/block` - Block a user

#### Personas
- `GET /api/personas` - Get user's personas
- `POST /api/personas` - Create a new persona
- `PUT /api/personas/:id` - Update persona

### Authentication
All authenticated endpoints require:
- Header: `Authorization: Bearer <firebase-id-token>`
- The backend verifies the token using Firebase Admin SDK

---

## 📊 Current Project Status

### ✅ Completed Features
- News feed with Today Edition and Explore sections
- Firebase authentication (Phone OTP + Google Sign-In)
- Reddit-like comment system with personas
- Comment voting, replies, edit/delete
- User moderation (report, block)
- Rate limiting and abuse detection
- Backend API deployed on GCP Cloud Run
- Database and Redis infrastructure on GCP
- Content ingestion platform (Inshorts adapter)
- Image processing and storage
- LLM-based content rewriting (Gemini)

### 🚧 Recent Work
- APK build fixes and configuration
- Deployment to Mumbai region (asia-south1)
- Infrastructure setup on GCP
- Firebase integration
- Comment system implementation
- Database schema with Prisma (full schema in `ingestion-platform/prisma/schema.prisma`)

### 📋 Database Schema Overview
The database includes:
- **ContentItem** - News articles/content
- **Edition** - Daily editions
- **EditionStory** - Stories in editions
- **ExploreItem** - Explore section items
- **User** - User accounts (linked to Firebase)
- **Persona** - Anonymous/Verified personas
- **Comment** - Comments with voting
- **CommentVote** - User votes on comments
- **CommentReport** - Reported comments
- **UserBlock** - Blocked users
- **UserDevice** - Device tracking for abuse prevention
- **CategoryPreference** - User category preferences
- **CategoryRankingSignal** - Auto-scoring for categories
- **IngestionRun** - Ingestion job tracking
- **SourceState** - Source state management
- **ImageSearchCache** - Cached image search results

See `ingestion-platform/prisma/schema.prisma` for complete schema.

### 📝 Important Notes
- **All changes are committed locally** (see git status)
- **Remote repository may need to be set up** (currently not found)
- **API is deployed and running** on GCP Cloud Run
- **Database migrations may need to be run** on production

---

## 🔧 Common Tasks

### Updating API URL in Frontend
Edit `api/apiIngestion.ts`:
```typescript
// Current value in code (line 13):
const PRODUCTION_API_URL = 'https://whatsay-api-jsewdobsva-el.a.run.app';

// Should be updated to:
const PRODUCTION_API_URL = 'https://whatsay-api-278662370606.asia-south1.run.app';
```

**Note:** The code also has logic for local development:
- Physical device: `http://192.168.0.101:3000` (update IP if changed)
- Emulator: `http://localhost:3000`

### Deploying Backend Changes
```bash
cd ingestion-platform
gcloud run deploy whatsay-api \
  --source . \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

### Running Database Migrations on Production
```bash
gcloud run jobs execute whatsay-migrate \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

### Checking Deployment Status
```bash
gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

### Viewing Logs
```bash
gcloud run services logs read whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165
```

---

## 🔐 Credentials & Configuration

**⚠️ IMPORTANT: Read `CREDENTIALS_AND_CONFIG.md` for all credentials, API keys, and configuration details.**

Key credentials locations:
- GCP Project: `gen-lang-client-0803362165`
- Firebase Project: `whatsay-app-c3627`
- Secrets stored in GCP Secret Manager
- Environment variables in `ingestion-platform/.env` (not committed)

---

## 🐛 Troubleshooting

### Backend Issues
- Check `ingestion-platform/.env` exists and has correct values
- Verify database connection string
- Check Redis connection
- Review GCP Secret Manager for missing secrets

### Frontend Issues
- Clear Metro cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check API URL in `api/apiIngestion.ts`
- Verify Firebase configuration files exist

### Build Issues
- Check `eas.json` for correct build profiles
- Verify Apple Developer credentials (for iOS)
- Check Android build.gradle for version conflicts
- Review build logs in EAS dashboard

### Deployment Issues
- Verify GCP authentication: `gcloud auth list`
- Check project: `gcloud config get-value project`
- Review Cloud Build logs in GCP Console
- Check Cloud Run service status

---

## 📚 Key Documentation Files

- **`CREDENTIALS_AND_CONFIG.md`** - All credentials and configuration (READ FIRST)
- **`README.md`** - Project overview and quick start
- **`APP_ARCHITECTURE.md`** - Architecture details
- **`FINAL_DEPLOYMENT_STATUS.md`** - Current deployment status
- **`PRE_LAUNCH_ACTIONS_COMPLETE.md`** - Pre-launch checklist

---

## 🎯 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow React Native best practices
- Use Redux Toolkit for state management
- Follow Expo Router conventions for routing

### File Naming
- Components: PascalCase (e.g., `CardAnimation.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAnimations.ts`)
- Utilities: camelCase (e.g., `apiIngestion.ts`)

### Git Workflow
- All changes are currently committed locally
- Remote repository may need setup
- Use descriptive commit messages

### Environment Variables
- Never commit `.env` files
- Use `env.example` as template
- Store production secrets in GCP Secret Manager

---

## 🚨 Important Warnings

1. **Never commit credentials** - Use Secret Manager or `.env` (gitignored)
2. **Always use absolute paths** - `/Users/basith/Documents/whatsay-app-main`
3. **Check GCP costs** - Resources are in Mumbai region, monitor usage
4. **Database migrations** - May need to run on production
5. **Remote repository** - May need to be created or updated

---

## 📞 Quick Reference

**Project Path:**
```
/Users/basith/Documents/whatsay-app-main
```

**GCP Project:**
```
gen-lang-client-0803362165
```

**API URLs:**
```
Production: https://whatsay-api-278662370606.asia-south1.run.app
Previous:   https://whatsay-api-jsewdobsva-el.a.run.app
Local Dev:  http://localhost:3000 (emulator)
            http://192.168.0.101:3000 (physical device)
```

**Firebase Project:**
```
whatsay-app-c3627
```

---

**Last Updated:** Generated for coding agent handoff
**Status:** Production-ready, deployed on GCP
**Next Steps:** Review `CREDENTIALS_AND_CONFIG.md` for all credentials
