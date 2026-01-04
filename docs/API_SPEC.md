# Mywasiyat API Specification

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT token in `Authorization: Bearer <token>` header.

Get token via:
- `POST /auth/otp/verify` - Returns `{ accessToken, user }`
- `POST /auth/oauth/callback` - Returns `{ accessToken, user }`

## API Endpoints

### Authentication

#### Send OTP
```http
POST /auth/otp/send
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development mode
}
```

#### Verify OTP
```http
POST /auth/otp/verify
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx...",
    "phone": "+919876543210",
    "email": null,
    "fullName": null
  }
}
```

#### OAuth Callback
```http
POST /auth/oauth/callback
Content-Type: application/json

{
  "provider": "google",
  "profile": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### Wills

#### Create Will
```http
POST /wills
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Will",
  "personalLaw": "HINDU",
  "previousWillExists": false,
  "profile": {
    "fullName": "John Doe",
    "gender": "MALE",
    "dateOfBirth": "1980-01-01",
    "maritalStatus": "MARRIED",
    "religionLabel": "Hindu"
  }
}
```

#### Get Will
```http
GET /wills/:id
Authorization: Bearer <token>
```

**Response:** Full will object with all relations (profile, people, scenarios, executor, witnesses, signature, assets)

#### Update Will
```http
PATCH /wills/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "stepBasicInfo": "COMPLETED"
}
```

#### Update Basic Info (Step 1)
```http
PATCH /wills/:id/basic-info
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "gender": "MALE",
  "dateOfBirth": "1980-01-01",
  "maritalStatus": "MARRIED",
  "religionLabel": "Hindu",
  "personalLaw": "HINDU",
  "previousWillExists": false
}
```

---

### People (Family Members)

#### Add Person
```http
POST /wills/:willId/people
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "relationship": "SPOUSE",
  "gender": "FEMALE",
  "dateOfBirth": "1982-05-15",
  "email": "jane@example.com",
  "phone": "+919876543211"
}
```

#### List People
```http
GET /wills/:willId/people
Authorization: Bearer <token>
```

#### Update Person
```http
PATCH /wills/:willId/people/:personId
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Jane Doe Updated",
  "isBeneficiary": true
}
```

#### Delete Person
```http
DELETE /wills/:willId/people/:personId
Authorization: Bearer <token>
```

#### Assign Guardian
```http
POST /wills/:willId/people/guardians
Authorization: Bearer <token>
Content-Type: application/json

{
  "childPersonId": "person_id",
  "guardianPersonId": "guardian_id",
  "alternateGuardianPersonId": "alt_guardian_id"  // Optional
}
```

---

### Inheritance Scenarios

#### Create/Update Scenario
```http
POST /wills/:willId/inheritance/scenarios
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "USER_DIES_FIRST",
  "title": "If I die before my spouse",
  "notes": "Optional notes",
  "allocationJson": {
    "allocations": [
      {
        "personId": "person_id_1",
        "percentage": 50,
        "description": "Spouse gets 50%"
      },
      {
        "personId": "person_id_2",
        "percentage": 50,
        "description": "Child gets 50%"
      }
    ]
  }
}
```

**Response includes warnings for Muslim bequests:**
```json
{
  "scenario": { ... },
  "warnings": [
    "Muslim bequest to non-heirs (40.00%) exceeds the 1/3 limit..."
  ]
}
```

#### List Scenarios
```http
GET /wills/:willId/inheritance/scenarios
Authorization: Bearer <token>
```

---

### Arrangements

#### Assign Executor
```http
POST /wills/:willId/executor
Authorization: Bearer <token>
Content-Type: application/json

{
  "personId": "person_id"
}
```

#### Add Witness
```http
POST /wills/:willId/witnesses
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Witness Name",
  "email": "witness@example.com",
  "phone": "+919876543212",
  "addressLine": "123 Main St"
}
```

**Validation:** Witness cannot be a beneficiary. System checks and sets `isBeneficiaryConflict` flag.

#### List Witnesses
```http
GET /wills/:willId/witnesses
Authorization: Bearer <token>
```

#### Upload Signature
```http
POST /wills/:willId/signature
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "DRAWN",  // or "UPLOADED"
  "drawnSvg": "<svg>...</svg>",  // If drawn
  "fileUrl": "https://..."  // If uploaded
}
```

**Note:** Requires `declarationAcceptedAt` to be set first.

#### Upload Consent Video
```http
POST /wills/:willId/consent-video
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoUrl": "https://...",
  "transcript": "Optional transcript"
}
```

#### Accept Declaration
```http
POST /wills/:willId/declaration
Authorization: Bearer <token>
Content-Type: application/json

{
  "accepted": true
}
```

---

### Assets

#### Create Asset
```http
POST /wills/:willId/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "REAL_ESTATE",
  "title": "House in Mumbai",
  "description": "3BHK apartment",
  "ownershipType": "SELF_ACQUIRED",
  "ownershipShare": 100,
  "estimatedValue": 5000000,
  "currency": "INR",
  "transferToJson": {
    "beneficiaries": [
      {
        "personId": "person_id",
        "percentage": 100
      }
    ]
  }
}
```

**Response includes warnings for ancestral/HUF assets:**
```json
{
  "asset": { ... },
  "warnings": [
    "You can only will your share of ancestral/HUF property..."
  ]
}
```

#### List Assets
```http
GET /wills/:willId/assets?category=REAL_ESTATE
Authorization: Bearer <token>
```

#### Update Asset
```http
PATCH /wills/:willId/assets/:assetId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "ownershipShare": 50
}
```

#### Delete Asset
```http
DELETE /wills/:willId/assets/:assetId
Authorization: Bearer <token>
```

---

### PDF Generation

#### Generate PDF
```http
POST /wills/:willId/pdf/generate
Authorization: Bearer <token>
```

**Requirements:**
- Executor assigned
- At least 2 witnesses
- Signature uploaded
- Declaration accepted

**Response:**
```json
{
  "pdfVersion": {
    "id": "...",
    "versionNumber": 1,
    "fileUrl": "/uploads/wills/will_id/will_v1_1234567890.pdf",
    "fileHash": "sha256...",
    "generatedAt": "2024-01-01T00:00:00Z"
  },
  "fileUrl": "/uploads/wills/will_id/will_v1_1234567890.pdf",
  "message": "PDF generated successfully"
}
```

#### Get Latest PDF
```http
GET /wills/:willId/pdf/latest
Authorization: Bearer <token>
```

---

### AI Assistant

#### Query Assistant
```http
POST /assistant/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "willId": "will_id",  // Optional for context
  "question": "What is a witness?",
  "context": {
    "screen": "arrangements",
    "step": "witnesses"
  }
}
```

**Response:**
```json
{
  "answer": "You need at least 2 witnesses...",
  "whyThisMatters": "Witnesses who are beneficiaries...",
  "whatYouCanDoNext": "Add witnesses who are independent...",
  "deepLink": {
    "screen": "arrangements",
    "params": { "step": "witnesses" }
  },
  "disclaimer": "This is general information, not legal advice...",
  "shouldEscalate": false
}
```

#### Escalate to Human
```http
POST /assistant/escalate
Authorization: Bearer <token>
Content-Type: application/json

{
  "willId": "will_id",
  "reason": "Complex ancestral property question",
  "question": "Original question"
}
```

---

### Legal Aid

#### Create Request
```http
POST /legal-aid/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "willId": "will_id",
  "type": "WILL_REVIEW",
  "title": "Need will review",
  "notes": "I have ancestral property concerns",
  "priceInr": 5000,
  "scheduledAt": "2024-01-15T10:00:00Z"
}
```

#### List Requests
```http
GET /legal-aid/requests
Authorization: Bearer <token>
```

#### Get Request
```http
GET /legal-aid/requests/:id
Authorization: Bearer <token>
```

#### Send Message
```http
POST /legal-aid/requests/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I need help with..."
}
```

#### Update Status
```http
PATCH /legal-aid/requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PAID",
  "pricePaid": 5000
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Enums

### PersonalLaw
- `HINDU`
- `MUSLIM`
- `CHRISTIAN`
- `UNKNOWN`

### WillStatus
- `DRAFT`
- `IN_PROGRESS`
- `COMPLETED`
- `ARCHIVED`

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

### LegalAidRequestType
- `WILL_REVIEW`
- `CONSULTATION_CALL`
- `REGISTRATION_GUIDANCE`
- `DOCUMENT_CHECKLIST`

---

## Interactive Documentation

For interactive API documentation with request/response examples, visit:
**http://localhost:3000/api** (Swagger UI)
