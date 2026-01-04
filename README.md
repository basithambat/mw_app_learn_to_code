# Mywasiyat - Digital Will Creation Platform

A comprehensive digital will creation application for India, helping users create legally structured Last Will & Testament through guided steps. The platform supports Hindu, Muslim, and Christian personal laws with appropriate validations and warnings.

## Architecture

- **Backend**: NestJS + Prisma + PostgreSQL 16
- **Frontend**: Flutter (Mobile + Web) - *Coming soon*
- **Infrastructure**: Docker Compose for local development
- **Package Manager**: npm

## Project Structure

```
mywasiyat/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication (OTP, OAuth, JWT)
│   │   │   ├── users/    # User management
│   │   │   ├── wills/    # Will CRUD and basic info
│   │   │   ├── people/   # Family members and guardians
│   │   │   ├── inheritance/ # Inheritance scenarios
│   │   │   ├── personal-law/ # Personal law engine
│   │   │   ├── arrangements/ # Executor, witnesses, signature
│   │   │   ├── pdf/      # PDF generation
│   │   │   ├── assets/   # Asset management
│   │   │   ├── assistant/ # AI legal assistant
│   │   │   ├── legal-aid/ # Human legal aid services
│   │   │   └── validation/ # Business rule validation
│   │   └── prisma/       # Database schema
│   └── mobile_web/       # Flutter app (to be created)
├── packages/
│   └── shared/           # Shared TypeScript types/enums
├── docs/                 # Documentation
├── infra/                # Infrastructure configs
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose
- PostgreSQL 16 (via Docker)
- Flutter SDK (for frontend development)

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   cd apps/api && npm install
   ```

2. **Start infrastructure (PostgreSQL + Redis)**
   ```bash
   cd infra
   docker compose up -d
   ```

3. **Setup environment variables**
   ```bash
   cd apps/api
   cp ../../infra/env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Seed database (optional)**
   ```bash
   cd apps/api
   npm run prisma:seed
   ```

5. **Start backend**
   ```bash
   # From root
   npm run start:dev
   # Or from apps/api
   cd apps/api && npm run start:dev
   ```

6. **Access API documentation**
   - Swagger UI: `http://localhost:3000/api`
   - API Base: `http://localhost:3000`

### Environment Variables

See `infra/env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (optional)
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)

## API Endpoints

### Authentication
- `POST /auth/otp/send` - Send OTP to phone number
- `POST /auth/otp/verify` - Verify OTP and get JWT token
- `POST /auth/oauth/callback` - OAuth callback (Google/Facebook)

### Wills
- `POST /wills` - Create new will
- `GET /wills` - List all wills for user
- `GET /wills/:id` - Get will with all relations
- `PATCH /wills/:id` - Update will
- `POST /wills/:id/version` - Create new version
- `PATCH /wills/:id/basic-info` - Update basic info (Step 1)

### People (Family Members)
- `POST /wills/:willId/people` - Add family member
- `GET /wills/:willId/people` - List all people
- `GET /wills/:willId/people/:personId` - Get person details
- `PATCH /wills/:willId/people/:personId` - Update person
- `DELETE /wills/:willId/people/:personId` - Remove person
- `POST /wills/:willId/people/guardians` - Assign guardian to minor
- `GET /wills/:willId/people/guardians` - Get guardian assignments

### Inheritance Scenarios
- `POST /wills/:willId/inheritance/scenarios` - Create/update scenario
- `GET /wills/:willId/inheritance/scenarios` - List all scenarios

### Arrangements
- `POST /wills/:willId/executor` - Assign executor
- `POST /wills/:willId/witnesses` - Add witness
- `GET /wills/:willId/witnesses` - List witnesses
- `PATCH /wills/:willId/witnesses/:witnessId` - Update witness
- `DELETE /wills/:willId/witnesses/:witnessId` - Remove witness
- `POST /wills/:willId/signature` - Upload/draw signature
- `POST /wills/:willId/consent-video` - Upload consent video
- `POST /wills/:willId/declaration` - Accept capacity declaration

### Assets
- `POST /wills/:willId/assets` - Create asset
- `GET /wills/:willId/assets?category=` - List assets (optional filter)
- `GET /wills/:willId/assets/:assetId` - Get asset details
- `PATCH /wills/:willId/assets/:assetId` - Update asset
- `DELETE /wills/:willId/assets/:assetId` - Delete asset

### PDF Generation
- `POST /wills/:willId/pdf/generate` - Generate PDF will
- `GET /wills/:willId/pdf/latest` - Get latest PDF version

### AI Assistant
- `POST /assistant/query` - Query legal assistant with context
- `POST /assistant/escalate` - Escalate to human legal aid

### Legal Aid
- `POST /legal-aid/requests` - Create legal aid request
- `GET /legal-aid/requests` - List all requests
- `GET /legal-aid/requests/:id` - Get request details
- `POST /legal-aid/requests/:id/messages` - Send message
- `PATCH /legal-aid/requests/:id/status` - Update request status

## Features

### Core Features
- ✅ Multi-step will creation wizard
- ✅ Personal law awareness (Hindu, Muslim, Christian)
- ✅ Inheritance scenario planning (3 scenarios)
- ✅ Guardian assignment for minors
- ✅ Executor and witness management
- ✅ Digital signature support
- ✅ PDF generation with versioning
- ✅ Asset tracking with ownership types
- ✅ AI legal assistant (rule-based)
- ✅ Human legal aid integration

### Personal Law Support
- **Hindu/Jain/Buddhist/Sikh**: Free distribution of self-acquired assets, warnings for ancestral/HUF property
- **Muslim**: 1/3 bequest limit for non-heirs, auto-computation of heir status
- **Christian**: Free distribution similar to Hindu law

### Validation & Safety
- Witness eligibility validation (no beneficiaries, recommended against executor)
- Muslim bequest limit validation (33.33% for non-heirs)
- Ancestral/HUF asset warnings
- Minor guardian requirement checks
- Capacity declaration requirement

## Development

### Backend Development

```bash
cd apps/api
npm run start:dev    # Start with hot reload
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

### Database Management

```bash
cd apps/api
npx prisma studio    # Open Prisma Studio (GUI)
npx prisma migrate dev  # Create and apply migration
npx prisma generate  # Regenerate Prisma Client
```

### Code Style

- ESLint for linting
- Prettier for formatting
- TypeScript strict mode enabled

## Testing

```bash
cd apps/api
npm run test         # Unit tests
npm run test:e2e     # Integration tests
npm run test:cov     # Coverage report
```

## Documentation

- [PRD.md](docs/PRD.md) - Product Requirements Document
- [API_SPEC.md](docs/API_SPEC.md) - Detailed API Documentation
- [DB_SCHEMA.md](docs/DB_SCHEMA.md) - Database Schema Documentation
- [MASTER_PROMPT.md](docs/MASTER_PROMPT.md) - Implementation Guidelines

## Swagger Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- Interactive API documentation with request/response schemas

## License

Private - UNLICENSED

## Support

For issues and questions, please refer to the documentation or contact the development team.
