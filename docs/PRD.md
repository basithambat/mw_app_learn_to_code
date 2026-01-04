# Mywasiyat - Product Requirements Document

## Overview

Mywasiyat is a digital will creation application for India that helps users create legally structured Last Will & Testament through guided steps, generates PDF wills, and optionally tracks assets/liabilities/investments.

## Core Principles

- **NOT a law firm**: Does not provide legal advice
- Provides legal guidance, education, and structured document generation
- All legal answers must include disclaimers and offer escalation to human legal aids
- Personal law awareness: Hindu/Jain/Buddhist/Sikh, Muslim, Christian
- Calm, premium, minimal, milestone-driven UX (TurboTax-like for wills)
- Continuous save, edit anytime, versioning support

## Platforms

- Single codebase for Mobile + Web (Flutter)
- Optional Next.js marketing site
- Backend: NestJS + PostgreSQL

## User Flows

### A) Auth / Entry
- Splash sequence (3 screens)
- Login: Phone OTP, Google, Facebook
- T&C and Privacy policy acceptance

### B) Onboarding / Basic Info (Will Step 1)
- Full legal name, gender, DOB
- Marital status (married/engaged/divorced/separated/widowed/single)
- Spouse details (if applicable)
- Children details + under 18 check
- Guardian flow for minors
- Asset category selection (multi-select)

### C) Milestone Dashboard
- Stepper showing 4 steps:
  1. Basic info
  2. Family & inheritance
  3. Will arrangements
  4. Accounts & properties (Optional)
- Status: not started / in progress / completed / edit

### D) Family & Inheritance (Will Step 2)
- Capture family members: spouse, children, mother, others
- Add guardians for under-18 children
- Guardian details, relationships

### E) Inheritance Distribution (Scenario Based)
- Scenario 1: User dies before spouse
- Scenario 2: Spouse dies before user
- Scenario 3: No one survives
- Each scenario has allocations and fallback rules
- Personal law aware (Hindu/Muslim/Christian)

### F) Will Arrangements (Will Step 3)
- Assign executor
- Add two witnesses (non-heirs, not beneficiaries)
- Add signature (upload or draw)
- Record video consent (optional)
- Generate will → "Yay your will is ready"
- Will preview: paginated PDF viewer
- Next steps: Add assets, Notify witnesses

### G) Accounts & Properties (Step 4 - Optional)
- Asset categories: Real estate, Vehicles, Gadgets, Jewellery, Business, Investments, Liabilities
- Asset metadata: value, ownership type, transfer_to beneficiaries
- Nominee disclaimers for insurance/PF

## AI Legal Aid Assistant

- Global floating button (bottom-right)
- Context-aware: knows willId, step, religion, family structure
- Short, structured answers with disclaimers
- Deep-link to relevant screens
- Escalation to human legal aid

## Human Legal Aid Services

- Will review
- Consultation calls
- Registration guidance
- Document checklists
- Booking + payment integration (UPI/cards)
- Status tracking

## Personal Law Engine

### Hindu/Jain/Buddhist/Sikh
- Free distribution of self-acquired assets
- Warning for ancestral/joint assets

### Muslim
- Mode 1: Follow Islamic inheritance rules (recommended)
- Mode 2: Custom will (1/3 limit for non-heirs)
- Wasiyyat section in PDF

### Christian
- Free distribution of self-owned assets
- Standard disclaimers

## Validation Rules

- Witness must not be heir/beneficiary/executor
- Must have 2 witnesses
- Must have executor
- Must have signature before PDF generation
- Minor children → guardian recommended
- Muslim custom bequest > 1/3 → warning/block

## MVP Scope (Phase 1)

- Auth (OTP, OAuth)
- Steps 1-3 (Basic Info, Family & Inheritance, Will Arrangements)
- PDF generation with personal law awareness
- Basic AI assistant (rule-based)
- Human legal aid request flow (booking placeholder)
- Manual asset entry
- Witness invite emails (status only)

## Phase 2 (Future)

- Auto-track liabilities/investments
- Witness eSign/confirmation
- Advanced Muslim inheritance engine
- Registration support
- Full legal aid marketplace
