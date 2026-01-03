# WhatSay App - News Aggregation Platform

A React Native news app with Reddit-like commenting system, built with Expo, Firebase Auth, and a Node.js ingestion platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Firebase project
- Expo CLI

### Setup

1. **Install Dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd ingestion-platform
   npm install
   ```

2. **Apply Database Migration**
   ```bash
   cd ingestion-platform
   npx prisma migrate dev
   ```

3. **Start Backend**
   ```bash
   cd ingestion-platform
   npm run dev
   ```

4. **Start Expo**
   ```bash
   npx expo start
   ```

---

## 📚 Documentation

### Comment System
- `QUICK_START_COMMENTS.md` - Get started with comments
- `COMMENT_SYSTEM_READY.md` - Complete status
- `COMMENT_SYSTEM_ENHANCEMENTS.md` - UX features
- `MIGRATION_GUIDE.md` - Database migration guide

### Implementation
- `IMPLEMENTATION_SUMMARY.md` - Full implementation details
- `FINAL_STATUS.md` - Current status
- `PENDING_TASKS.md` - Remaining tasks

---

## 🎯 Features

### News Feed
- Today Edition (stable daily cards)
- Explore Pool (dynamic rails)
- Category-based organization
- Personalized ranking

### Comment System
- Reddit-like identity (Anonymous/Verified)
- Per-comment persona selection
- Comment voting (upvote/downvote)
- Nested replies
- Edit/Delete comments
- Report & Block users
- Rate limiting & moderation

### Authentication
- Firebase Phone OTP
- Google Sign-In
- Reddit-like persona system

---

## 🏗️ Architecture

### Frontend
- React Native / Expo
- Redux Toolkit
- Firebase Auth
- TypeScript

### Backend
- Node.js / Fastify
- PostgreSQL / Prisma
- Firebase Admin SDK
- Rate limiting
- Abuse detection

---

## 📁 Project Structure

```
whatsay-app-main/
├── app/                    # Expo app routes
├── components/              # React components
│   ├── PersonaSelector.tsx
│   └── comment/            # Comment components
├── api/                    # API clients
│   └── apiComments.ts
├── redux/                  # State management
│   └── slice/
│       └── articlesComments.ts
├── ingestion-platform/     # Backend API
│   ├── src/
│   │   ├── services/       # Business logic
│   │   ├── middleware/    # Auth, rate limiting
│   │   └── index.ts       # API endpoints
│   └── prisma/            # Database schema
└── docs/                   # Documentation
```

---

## 🔧 Configuration

### Environment Variables

**Backend** (`ingestion-platform/.env`):
```env
DATABASE_URL=postgresql://...
FIREBASE_SERVICE_ACCOUNT={...}
PORT=3000
```

**Frontend** (`api/apiIngestion.ts`):
- Update `getIngestionApiBase()` with your backend URL

---

## 🧪 Testing

### Backend
```bash
cd ingestion-platform
npm run dev
# Test endpoints at http://localhost:3000
```

### Frontend
```bash
npx expo start
# Scan QR code or use emulator
```

---

## 📊 Status

- ✅ News feed (Today + Explore)
- ✅ Firebase authentication
- ✅ Reddit-like comment system
- ✅ Persona system (Anonymous/Verified)
- ✅ Moderation & rate limiting
- ✅ UX enhancements (optimistic updates, sorting, etc.)

---

## 🐛 Troubleshooting

See individual documentation files:
- `MIGRATION_GUIDE.md` - Database issues
- `QUICK_START_COMMENTS.md` - Comment system issues
- `COMMENT_SYSTEM_READY.md` - General troubleshooting

---

## 📝 License

[Your License Here]

---

**Built with ❤️ using React Native, Expo, and Node.js**
