# Mywasiyat Database Schema

## Overview

PostgreSQL 16 database managed via Prisma ORM. All timestamps are in UTC.

## Core Entities

### User
User account and authentication information.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| phone | String? | Phone number (unique) |
| email | String? | Email address (unique) |
| fullName | String? | User's full name |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| acceptedTosAt | DateTime? | Terms of service acceptance |
| acceptedPrivacyAt | DateTime? | Privacy policy acceptance |

**Relations:**
- `wills` - One-to-many with Will
- `auditLogs` - One-to-many with AuditLog
- `legalAidRequests` - One-to-many with LegalAidRequest
- `assistantThreads` - One-to-many with AssistantThread

---

### Will
Main will document entity.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | Foreign key to User |
| status | WillStatus | DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED |
| title | String? | Will title |
| personalLaw | PersonalLaw | HINDU, MUSLIM, CHRISTIAN, UNKNOWN |
| previousWillExists | Boolean | Whether user has previous will |
| declarationAcceptedAt | DateTime? | Capacity declaration acceptance |
| legalHeirsConfirmedAt | DateTime? | Legal heirs confirmation timestamp |
| stepBasicInfo | StepStatus | Step 1 completion status |
| stepFamily | StepStatus | Step 2 completion status |
| stepArrangements | StepStatus | Step 3 completion status |
| stepAssets | StepStatus | Step 4 completion status |
| stepLegalReview | StepStatus | Step 5 completion status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- `profile` - One-to-one with WillProfile
- `people` - One-to-many with WillPerson
- `scenarios` - One-to-many with InheritanceScenario
- `guardianAssignments` - One-to-many with GuardianAssignment
- `executorAssignments` - One-to-many with ExecutorAssignment
- `witnesses` - One-to-many with Witness
- `signature` - One-to-one with Signature
- `consentVideo` - One-to-one with ConsentVideo
- `assets` - One-to-many with Asset
- `pdfVersions` - One-to-many with WillPdfVersion
- `legalAidRequests` - One-to-many with LegalAidRequest
- `auditLogs` - One-to-many with AuditLog
- `assistantThreads` - One-to-many with AssistantThread

---

### WillProfile
Separated profile data for the testator.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will (unique) |
| fullName | String? | Testator's full name |
| gender | Gender? | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| dateOfBirth | DateTime? | Date of birth |
| maritalStatus | String? | MARRIED, SINGLE, etc. |
| religionLabel | String? | User-facing religion string |
| personalLaw | PersonalLaw | Computed personal law |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### WillPerson
Family members and beneficiaries.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| fullName | String | Person's full name |
| relationship | RelationshipType | SPOUSE, SON, DAUGHTER, etc. |
| gender | Gender? | Gender |
| dateOfBirth | DateTime? | Date of birth |
| isMinor | Boolean | Computed: age < 18 |
| email | String? | Email address |
| phone | String? | Phone number |
| isHeir | Boolean? | Computed for Muslim law (Quranic heir) |
| isBeneficiary | Boolean | Whether included in allocations |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- `guardianOf` - Guardian assignments where this person is the child
- `guardianAs` - Guardian assignments where this person is the guardian
- `alternateGuardianAs` - Guardian assignments where this person is alternate guardian
- `executorAssignments` - Executor assignments

**Constraints:**
- Only one SPOUSE per will
- Only one MOTHER per will
- Only one FATHER per will

---

### GuardianAssignment
Guardian assignment for minor children.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| childPersonId | String | Foreign key to WillPerson (child) |
| guardianPersonId | String | Foreign key to WillPerson (guardian) |
| alternateGuardianPersonId | String? | Foreign key to WillPerson (alternate) |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Validation:**
- Child must be a minor
- Guardian must be an adult

---

### InheritanceScenario
Inheritance distribution scenarios.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| type | ScenarioType | USER_DIES_FIRST, SPOUSE_DIES_FIRST, NO_ONE_SURVIVES |
| title | String? | Scenario title |
| notes | String? | Optional notes |
| allocationJson | JSON | `{ allocations: [{ personId, percentage, description? }], meta?: {...} }` |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Unique Constraint:** `(willId, type)` - One scenario per type per will

**Validation:**
- Total allocation must equal 100%
- Percentages must be positive and ≤ 100
- For Muslim wills: Non-heir allocations must not exceed 33.33%

---

### ExecutorAssignment
Executor appointment.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| personId | String | Foreign key to WillPerson |
| isPrimary | Boolean | Primary executor flag |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Witness
Witness information and eligibility.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| fullName | String | Witness name |
| email | String? | Email address |
| phone | String? | Phone number |
| addressLine | String? | Address |
| status | WitnessStatus | PENDING, INVITED, CONFIRMED |
| isBeneficiaryConflict | Boolean | Whether witness is a beneficiary (block) |
| isExecutorConflict | Boolean | Whether witness is executor (warn) |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Validation:**
- Must have email or phone
- Cannot be a beneficiary (blocked)
- Should not be executor (warning)
- Should not be spouse/children/parents (warning)

---

### Signature
Digital signature.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will (unique) |
| type | SignatureType | DRAWN, UPLOADED |
| fileUrl | String? | URL if uploaded |
| drawnSvg | String? | SVG string if drawn |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Requirement:** `declarationAcceptedAt` must be set before signature.

---

### ConsentVideo
Optional consent video for defensibility.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will (unique) |
| status | ConsentVideoStatus | NOT_RECORDED, RECORDED, VERIFIED |
| videoUrl | String? | Video file URL |
| transcript | String? | Video transcript |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Asset
Assets and properties.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| category | AssetCategory | REAL_ESTATE, VEHICLE, etc. |
| title | String? | Asset title |
| description | String? | Asset description |
| ownershipType | OwnershipType | SELF_ACQUIRED, JOINT, ANCESTRAL, HUF, etc. |
| ownershipShare | Float? | Percentage of ownership (0-100) |
| estimatedValue | Float? | Estimated value |
| currency | String | Currency code (default: INR) |
| metadataJson | JSON? | Flexible metadata |
| transferToJson | JSON? | `{ beneficiaries: [{ personId, percentage }] }` or `{ allHeirs: true }` |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Warnings:**
- Ancestral/HUF assets: User can only will their share
- Joint assets: Ensure only user's share is distributed

---

### WillPdfVersion
Versioned PDF storage.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| versionNumber | Int | Version number (1, 2, 3...) |
| fileUrl | String | PDF file URL |
| fileHash | String | SHA-256 hash of PDF |
| generatedAt | DateTime | Generation timestamp |
| createdAt | DateTime | Creation timestamp |

**Unique Constraint:** `(willId, versionNumber)`

---

### LegalAidRequest
Human legal aid service requests.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String? | Foreign key to Will (optional) |
| userId | String | Foreign key to User |
| type | LegalAidRequestType | WILL_REVIEW, CONSULTATION_CALL, etc. |
| status | LegalAidRequestStatus | CREATED, PAID, ASSIGNED, etc. |
| title | String? | Request title |
| notes | String? | Request notes |
| priceInr | Int? | Price in INR |
| paidAt | DateTime? | Payment timestamp |
| assignedLawyerId | String? | Assigned lawyer (future) |
| scheduledAt | DateTime? | Scheduled consultation time |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- `messages` - One-to-many with LegalAidMessage

---

### LegalAidMessage
Chat messages in legal aid requests.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| requestId | String | Foreign key to LegalAidRequest |
| senderType | MessageSenderType | USER, LAWYER, SYSTEM, ASSISTANT |
| message | String | Message text |
| createdAt | DateTime | Creation timestamp |

---

### AssistantThread
AI assistant conversation threads.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | Foreign key to User |
| willId | String? | Foreign key to Will (optional) |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- `messages` - One-to-many with AssistantMessage

---

### AssistantMessage
AI assistant conversation messages.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| threadId | String | Foreign key to AssistantThread |
| senderType | MessageSenderType | USER, ASSISTANT |
| message | String | Message text |
| contextJson | JSON? | Additional context |
| createdAt | DateTime | Creation timestamp |

---

### CreditBureauConsent
Phase 2: Credit bureau sync consent.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| provider | SyncProvider | EXPERIAN, CRIF, CIBIL, OTHER |
| consentGiven | Boolean | Consent status |
| consentGivenAt | DateTime? | Consent timestamp |
| email | String? | Email for sync |
| pan | String? | PAN for sync |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### InvestmentSyncConsent
Phase 2: Investment sync consent.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| willId | String | Foreign key to Will |
| consentGiven | Boolean | Consent status |
| consentGivenAt | DateTime? | Consent timestamp |
| email | String? | Email for sync |
| pan | String? | PAN for sync |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### AuditLog
Complete audit trail.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String? | Foreign key to User |
| willId | String? | Foreign key to Will |
| action | String | Action name |
| entityType | String? | Entity type |
| entityId | String? | Entity ID |
| beforeJson | JSON? | State before change |
| afterJson | JSON? | State after change |
| createdAt | DateTime | Creation timestamp |

---

## Enums

### WillStatus
- `DRAFT`
- `IN_PROGRESS`
- `COMPLETED`
- `ARCHIVED`

### PersonalLaw
- `HINDU`
- `MUSLIM`
- `CHRISTIAN`
- `UNKNOWN`

### StepStatus
- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`
- `NEEDS_ATTENTION`

### RelationshipType
- `SELF`
- `SPOUSE`
- `SON`
- `DAUGHTER`
- `MOTHER`
- `FATHER`
- `BROTHER`
- `SISTER`
- `OTHER`

### Gender
- `MALE`
- `FEMALE`
- `OTHER`
- `PREFER_NOT_TO_SAY`

### AssetCategory
- `REAL_ESTATE`
- `VEHICLE`
- `GADGET`
- `JEWELLERY`
- `BUSINESS`
- `INVESTMENT`
- `LIABILITY`
- `BANK_ACCOUNT`
- `INSURANCE`
- `OTHER`

### OwnershipType
- `SELF_ACQUIRED`
- `JOINT`
- `INHERITED`
- `ANCESTRAL`
- `HUF`
- `GIFTED`

### ScenarioType
- `USER_DIES_FIRST`
- `SPOUSE_DIES_FIRST`
- `NO_ONE_SURVIVES`

### WitnessStatus
- `PENDING`
- `INVITED`
- `CONFIRMED`

### SignatureType
- `DRAWN`
- `UPLOADED`

### ConsentVideoStatus
- `NOT_RECORDED`
- `RECORDED`
- `VERIFIED`

### LegalAidRequestType
- `WILL_REVIEW`
- `CONSULTATION_CALL`
- `REGISTRATION_GUIDANCE`
- `DOCUMENT_CHECKLIST`

### LegalAidRequestStatus
- `CREATED`
- `PAID`
- `ASSIGNED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

### MessageSenderType
- `USER`
- `LAWYER`
- `SYSTEM`
- `ASSISTANT`

### SyncProvider
- `EXPERIAN`
- `CRIF`
- `CIBIL`
- `OTHER`

---

## Indexes

Primary indexes on:
- `User.phone` (unique)
- `User.email` (unique)
- `Will.userId`
- `WillPerson.willId`
- `InheritanceScenario.willId_type` (unique)
- `Witness.willId`
- `Asset.willId`
- `WillPdfVersion.willId_versionNumber` (unique)

---

## Relationships Summary

```
User
  ├── Will (1:N)
  │     ├── WillProfile (1:1)
  │     ├── WillPerson (1:N)
  │     │     ├── GuardianAssignment (as child) (1:N)
  │     │     ├── GuardianAssignment (as guardian) (1:N)
  │     │     └── ExecutorAssignment (1:N)
  │     ├── InheritanceScenario (1:N)
  │     ├── GuardianAssignment (1:N)
  │     ├── ExecutorAssignment (1:N)
  │     ├── Witness (1:N)
  │     ├── Signature (1:1)
  │     ├── ConsentVideo (1:1)
  │     ├── Asset (1:N)
  │     ├── WillPdfVersion (1:N)
  │     └── LegalAidRequest (1:N)
  ├── LegalAidRequest (1:N)
  │     └── LegalAidMessage (1:N)
  └── AssistantThread (1:N)
        └── AssistantMessage (1:N)
```

---

## Migration Commands

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# View database
npx prisma studio
```

---

## Notes

- All foreign keys have `onDelete: Cascade` or `onDelete: SetNull` as appropriate
- Timestamps are automatically managed by Prisma
- JSON fields are used for flexible data structures (allocations, metadata, etc.)
- Unique constraints prevent duplicate scenarios and PDF versions
- Computed fields (`isMinor`, `isHeir`) are calculated at runtime
