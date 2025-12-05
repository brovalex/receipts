# Receipts App v2.0 - Production Ready Upgrade

## Project Overview

Transform the existing receipts tracking app (for celiac tax credits) from a single-user prototype into a production-ready, multi-tenant application with proper authentication, tax year management, and improved UX.

## Current State Analysis

### Tech Stack
- **Frontend**: Next.js 14.2.24 (App Router), React 18, TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **UI**: Flowbite React, Tailwind CSS
- **Deployment**: Docker Compose

### Current Features
- Receipt list with year filtering
- Receipt detail view with image and OCR text boxes
- Expense management (CRUD)
- Product catalog with reference items
- Price proof validation system
- Basic reviewed/rejected status

### Key Gaps Identified
1. **No Authentication** - Anyone can access all data
2. **No Multi-Tenancy** - Single user, all data shared
3. **No Tax Year Management** - Can't close/archive years
4. **No User Settings** - No preferences or configuration
5. **No Proper Navigation** - Missing header, sidebar
6. **No Dashboard** - No summaries or insights
7. **Limited Error Handling** - Basic error handling only
8. **No Input Validation** - API routes lack proper validation

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Dashboard │ │ Receipts │ │ Products │ │ Settings │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                         │                                   │
│              ┌──────────────────────┐                       │
│              │   Auth Middleware    │                       │
│              │      (Kinde)         │                       │
│              └──────────────────────┘                       │
│                         │                                   │
│              ┌──────────────────────┐                       │
│              │     API Routes       │                       │
│              │  (Multi-tenant)      │                       │
│              └──────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                          │
              ┌──────────────────────┐
              │   PostgreSQL DB      │
              │   (Multi-tenant)     │
              └──────────────────────┘
```

## Implementation Phases

### Phase 0: Foundation & Cleanup
**Goal**: Prepare codebase for major changes

- [ ] Audit and upgrade dependencies
- [ ] Improve TypeScript types
- [ ] Add environment variable validation
- [ ] Standardize API response formats
- [ ] Add proper error handling utilities
- [ ] Clean up unused code
- [ ] Add base layout component structure

### Phase 1: Authentication with Kinde
**Goal**: Secure the application with user authentication

- [ ] Set up Kinde account and application
- [ ] Install @kinde-oss/kinde-auth-nextjs
- [ ] Configure Kinde environment variables
- [ ] Create auth API routes (login, logout, callback)
- [ ] Add authentication middleware
- [ ] Protect all API routes
- [ ] Create login/logout UI components
- [ ] Add user profile display

### Phase 2: Multi-Tenancy Architecture
**Goal**: Isolate data by user/organization

- [ ] Add User model to Prisma schema
- [ ] Add userId to all relevant models
- [ ] Create database migration strategy
- [ ] Update all API routes with user filtering
- [ ] Add user context provider
- [ ] Handle existing data migration
- [ ] Test data isolation

### Phase 3: Tax Year Management
**Goal**: Allow users to manage and close tax years

- [ ] Add TaxYear model (year, status, userId)
- [ ] Link receipts to tax years
- [ ] Create tax year settings UI
- [ ] Implement year closing workflow
- [ ] Add yearly summary calculations
- [ ] Export tax year report functionality
- [ ] Handle year transitions

### Phase 4: Dashboard & Reporting
**Goal**: Provide insights and summaries

- [ ] Design dashboard layout
- [ ] Implement summary statistics
- [ ] Add charts for expenses by category
- [ ] Year-over-year comparisons
- [ ] Recent activity feed
- [ ] Export functionality (CSV, PDF)

### Phase 5: UI/UX Improvements
**Goal**: Polish the user experience

- [ ] Create consistent navigation header
- [ ] Add sidebar for main navigation
- [ ] Implement proper loading states
- [ ] Add toast notifications
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts
- [ ] Implement dark mode properly

## Branch Strategy

```
main
  └── release/v2.0-production-ready
        ├── feature/phase-0-foundation
        ├── feature/phase-1-kinde-auth
        ├── feature/phase-2-multi-tenancy
        ├── feature/phase-3-tax-years
        ├── feature/phase-4-dashboard
        └── feature/phase-5-ui-polish
```

## Database Schema Changes Preview

### New Models
```prisma
model User {
  id           String    @id @default(cuid())
  kindeId      String    @unique @map("kinde_id")
  email        String    @unique
  name         String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  receipts     Receipt[]
  products     Product[]
  taxYears     TaxYear[]
  settings     UserSettings?
}

model TaxYear {
  id        Int       @id @default(autoincrement())
  year      Int
  status    TaxYearStatus @default(OPEN)
  closedAt  DateTime?
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  receipts  Receipt[]

  @@unique([userId, year])
}

model UserSettings {
  id              String  @id @default(cuid())
  userId          String  @unique
  defaultTaxYear  Int?
  currency        String  @default("USD")
  timezone        String  @default("America/Toronto")
  user            User    @relation(fields: [userId], references: [id])
}

enum TaxYearStatus {
  OPEN
  CLOSED
  ARCHIVED
}
```

### Modified Models (add userId)
- Receipt: add userId, taxYearId
- Product: add userId
- ReferenceItem: add userId (or keep global)
- ProductPriceProof: add userId

## Progress Tracking

| Phase | Status | Branch | Started | Completed |
|-------|--------|--------|---------|-----------|
| 0 | Not Started | feature/phase-0-foundation | - | - |
| 1 | Not Started | feature/phase-1-kinde-auth | - | - |
| 2 | Not Started | feature/phase-2-multi-tenancy | - | - |
| 3 | Not Started | feature/phase-3-tax-years | - | - |
| 4 | Not Started | feature/phase-4-dashboard | - | - |
| 5 | Not Started | feature/phase-5-ui-polish | - | - |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data migration issues | Medium | High | Test migrations on staging first |
| Kinde integration complexity | Low | Medium | Follow official docs, use SDK |
| Performance degradation | Low | Medium | Add proper indexes, test with data |
| Breaking existing functionality | Medium | High | Comprehensive testing |

## Success Criteria

1. Users can register and log in securely
2. Each user sees only their own data
3. Users can create, close, and reopen tax years
4. Dashboard shows relevant summaries
5. All existing functionality still works
6. Mobile-friendly responsive design
7. Proper error messages and loading states

## Timeline Estimate

This document does not include time estimates. Work will progress through each phase sequentially, with each phase completed before moving to the next.

---

*Document created: 2025-12-05*
*Last updated: 2025-12-05*
