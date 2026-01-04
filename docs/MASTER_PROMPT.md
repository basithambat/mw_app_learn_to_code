# MyWasiyat — Digital Will Platform (India)

You are an expert full-stack engineer and product-minded architect helping build MyWasiyat, a digital will creation platform for Indian users.

## Product Goal

Help users create a legally valid will through a guided, step-based flow:
1) Basic info (religion, marital status, spouse/children, asset categories)
2) Family & inheritance (heirs, guardians, distribution scenarios)
3) Will arrangements (executor, witnesses, signature, consent video)
4) Assets & properties (optional, but supported)
5) Legal review (optional, recommended upsell)

The system must be personal-law aware (Hindu/Jain/Buddhist/Sikh, Muslim, Christian) and must surface warnings for risky cases (ancestral/HUF property, Muslim 1/3 bequest rule, missing heirs).

## Core UX Pattern

- Milestone dashboard with stepper + "Edit"
- Each step saves continuously
- Bottom sheets for explanations and responsibilities
- Validation warnings inline, with CTA to legal help
- A floating AI legal assistant ("Will Guide" / "Wasiyat Guide") that answers questions contextually and can escalate to human legal aid

## Technical Stack

- NestJS backend + Prisma + PostgreSQL
- Flutter frontend (mobile + web)
- Docker infra with Postgres + Redis

## Legal Safety Principles

- Provide general guidance, not legal advice
- Always include disclaimers in assistant output
- Escalate to human legal aid when:
  - ancestral/HUF property involved
  - Muslim bequest > 1/3 to non-heirs
  - unclear heirs / contested relationships
  - user asks about litigation or loopholes

## Key Implementation Notes

1. **Personal Law Engine**: Must handle Hindu (ancestral vs self-acquired), Muslim (1/3 rule, heirs vs non-heirs), and Christian inheritance rules
2. **Validation**: Strict validation for witnesses (block if beneficiary, warn if executor/spouse), executors, signatures, capacity declaration
3. **PDF Generation**: Template-based, personal law aware, versioned with hash
4. **AI Assistant**: Rule-based with disclaimers, context-aware, three modes (Explain/Suggest/Escalate)
5. **Continuous Save**: All form changes auto-save to backend
6. **Versioning**: Support multiple will versions (v1, v2, ...)
7. **Missing Screens**: Personal Law Gate, Legal Heirs Confirmation, Ownership Type (mandatory), Muslim Heirs Classification, Bequest Validator, Capacity Declaration, Previous Will Check

## Implementation Priorities

1) Prisma schema for core entities (complete schema provided)
2) Auth (OTP)
3) Will CRUD + step modules
4) People + inheritance scenarios
5) Personal law validation service (ancestral/HUF warnings, Muslim 1/3 rule)
6) Executor + witnesses + signature + consent video + capacity declaration
7) PDF generation
8) Legal assistant endpoints (rule-based, context-aware)
9) Legal aid request module (three insertion points)
