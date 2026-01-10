# Enum Reference Guide

## Overview
This document serves as the single source of truth for all enum values used in the Mywasiyat application. All enums defined here MUST match between frontend (Flutter) and backend (NestJS/Prisma).

**Last Updated:** 2026-01-10  
**Schema Source:** `apps/api/prisma/schema.prisma`  
**Frontend Constants:** `apps/mobile_web/lib/core/constants/app_enums.dart`

---

## RelationshipType

**Description:** Defines the relationship between a person and the will creator.

### Valid Values
| Value | Description | Usage |
|-------|-------------|-------|
| `SELF` | Will creator themselves | Rarely used, mainly for reference |
| `SPOUSE` | Husband or Wife | Marriage partner |
| `SON` | Male child | Direct descendant, male |
| `DAUGHTER` | Female child | Direct descendant, female |
| `MOTHER` | Female parent | Direct ancestor, female |
| `FATHER` | Male parent | Direct ancestor, male |
| `BROTHER` | Male sibling | Same parents or one shared parent |
| `SISTER` | Female sibling | Same parents or one shared parent |
| `OTHER` | Any other relationship | Extended family, friends, charities |

### Important Notes
- ⚠️ **No "CHILD" value exists** - Use `SON` or `DAUGHTER`
- ⚠️ **No "FRIEND" or "CHARITY" values** - Use `OTHER` with `isBeneficiary` flag
- UI may display "Husband" or "Wife" but backend always uses `SPOUSE`

### Helper Methods (Flutter)
```dart
RelationshipType.isChild(String? rel)    // Returns true for SON or DAUGHTER
RelationshipType.isParent(String? rel)   // Returns true for MOTHER or FATHER
RelationshipType.isSibling(String? rel)  // Returns true for BROTHER or SISTER
```

---

## PersonalLaw

**Description:** Legal system governing inheritance distribution.

### Valid Values
| Value | Description | Inheritance Rules |
|-------|-------------|-------------------|
| `MUSLIM` | Islamic law (Sharia) | Fixed shares (Faraid), 2:1 son:daughter ratio |
| `HINDU` | Hindu law | Coparcenary rights, 1/(N+1) share limit for ancestral property |
| `CHRISTIAN` | Christian/Indian Succession Act | Full testamentary freedom |
| `UNKNOWN` | Not specified | Indian Succession Act (default) |

### Special Jurisdictions
- **Goa:** Portuguese Civil Code - 50% Compulsory Heirship regardless of `personalLaw`  
  _(Checked via `user.state === 'GOA'`)_

### Frontend Usage
```dart
if (_personalLaw == PersonalLaw.MUSLIM) {
  // Disable sliders, show "Fixed by Law" badge
}
```

---

## AssetCategory

**Description:** Types of assets that can be included in a will.

### Valid Values
| Value | Description | Examples |
|-------|-------------|----------|
| `REAL_ESTATE` | Land and buildings | House, apartment, plot |
| `VEHICLE` | Motor vehicles | Car, motorcycle, boat |
| `GADGET` | Electronic devices | Laptop, phone, camera |
| `JEWELLERY` | Precious metals and gems | Gold, diamond jewelry |
| `BUSINESS` | Business interests | Company shares, partnership |
| `INVESTMENT` | Financial investments | Stocks, mutual funds, bonds |
| `LIABILITY` | Debts and obligations | Loans, mortgages |
| `BANK_ACCOUNT` | Bank accounts | Savings, checking, FD |
| `INSURANCE` | Insurance policies | Life insurance, endowment |
| `DIGITAL` | Digital assets | Social media, crypto, emails |
| `OTHER` | Miscellaneous | Anything else |

### IT Act Compliance (Digital Assets)
Digital assets require special handling per IT Act 2000, Section 43/66. See `PdfService` for mandate generation.

---

## OwnershipType

**Description:** How an asset was acquired (affects inheritance in Hindu law).

### Valid Values
| Value | Description | Hindu Law Implication |
|-------|-------------|----------------------|
| `SELF_ACQUIRED` | Earned/purchased by self | Full testamentary freedom |
| `JOINT` | Co-owned with others | Only owner's share is bequeathable |
| `INHERITED` | Received through inheritance | May be ancestral or self-acquired |
| `ANCESTRAL` | Inherited from ancestors | **Coparcenary rules apply** - limited bequest (1/(N+1) share) |
| `HUF` | Hindu Undivided Family | Coparcenary property - same as ancestral |
| `GIFTED` | Received as gift | Generally treated as self-acquired |

### Critical for Legal Validation
`validateHinduWill()` in `PersonalLawService` uses this to enforce coparcenary limits.

---

## ScenarioType

**Description:** Inheritance distribution scenarios.

### Valid Values
| Value | Description | UI Label |
|-------|-------------|----------|
| `USER_DIES_FIRST` | User dies before spouse | "If you die before your spouse" |
| `SPOUSE_DIES_FIRST` | Spouse dies before user | "If your spouse dies before you" |
| `NO_ONE_SURVIVES` | No family members survive | "If no one from your family is living" |

### Usage Pattern
Each will has 3 scenarios. Each scenario has `allocationJson` with `allocations` array:
```json
{
  "type": "USER_DIES_FIRST",
  "allocationJson": {
    "allocations": [
      {"personId": "xxx", "percentage": 50}
    ]
  }
}
```

---

## Other Enums

### Gender
`MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`

### WitnessStatus
`PENDING`, `INVITED`, `CONFIRMED`

### SignatureType
`DRAWN`, `UPLOADED`

### ConsentVideoStatus
`NOT_RECORDED`, `RECORDED`, `VERIFIED`

### ConsentStatus
`PENDING`, `GIVEN`, `REFUSED`

---

## Common Pitfalls

### ❌ Don't Do This
```dart
// BAD: Hardcoded string
if (relationship == 'CHILD') { ... }

// BAD: Wrong enum value
if (relationship == 'FRIEND') { ... }
```

### ✅ Do This Instead
```dart
// GOOD: Use constant
if (RelationshipType.isChild(relationship)) { ... }

// GOOD: Use isBeneficiary flag for non-heirs
if (person['isBeneficiary'] == true) { ... }
```

---

## Validation Checklist

When adding new enum usage:
- [ ] Value exists in `schema.prisma`
- [ ] Value exists in `app_enums.dart`
- [ ] Using constant, not hardcoded string
- [ ] Integration test covers new usage
- [ ] Documentation updated

---

## Sync Process

1. **Update Prisma Schema first**
   ```prisma
   enum RelationshipType {
     // Add new value here
   }
   ```

2. **Run Prisma Generate**
   ```bash
   cd apps/api
   npx prisma generate
   ```

3. **Update Flutter Constants**
   Edit `apps/mobile_web/lib/core/constants/app_enums.dart`

4. **Run Tests**
   ```bash
   npm test           # Backend
   flutter test       # Frontend
   ```

5. **Update This Documentation**
