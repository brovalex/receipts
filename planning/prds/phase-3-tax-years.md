# Phase 3: Tax Year Management PRD

## Overview

Implement tax year management to allow users to organize receipts by tax year, close completed years to prevent accidental changes, and generate yearly summaries.

## Goals

1. Organize receipts by tax year
2. Close/archive completed tax years
3. Prevent modifications to closed years
4. Generate yearly summaries for tax filing
5. Easy year-over-year navigation

## Non-Goals

- Automated tax calculations (beyond simple sums)
- Tax form generation
- CRA/IRS integration
- Multi-currency support

## User Stories

1. **As a user**, I want to see my receipts organized by tax year so I can focus on the current year
2. **As a user**, I want to close a tax year when I've filed my taxes so I don't accidentally modify it
3. **As a user**, I want to see a summary of my total claims for each year
4. **As a user**, I want to reopen a closed year if I need to make corrections

## Requirements

### 1. Database Schema

**New TaxYear Model:**
```prisma
model TaxYear {
  id        Int           @id @default(autoincrement())
  year      Int
  status    TaxYearStatus @default(OPEN)
  closedAt  DateTime?     @map("closed_at")
  notes     String?
  userId    String        @map("user_id")
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")

  user      User          @relation(fields: [userId], references: [id])
  receipts  Receipt[]

  @@unique([userId, year])
  @@map("tax_year")
}

enum TaxYearStatus {
  OPEN
  CLOSED
  ARCHIVED
}
```

**Modified Receipt Model:**
```prisma
model Receipt {
  // ... existing fields
  taxYearId Int?      @map("tax_year_id")
  taxYear   TaxYear?  @relation(fields: [taxYearId], references: [id])
}
```

### 2. Tax Year Statuses

| Status | Description | Can Modify Receipts |
|--------|-------------|---------------------|
| OPEN | Active year, normal operations | Yes |
| CLOSED | Taxes filed, locked | No (read-only) |
| ARCHIVED | Old years, hidden from main view | No (read-only) |

### 3. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tax-years` | GET | List user's tax years |
| `/api/tax-years` | POST | Create new tax year |
| `/api/tax-years/[id]` | GET | Get tax year details with summary |
| `/api/tax-years/[id]` | PATCH | Update tax year (status, notes) |
| `/api/tax-years/[id]/close` | POST | Close tax year |
| `/api/tax-years/[id]/reopen` | POST | Reopen closed tax year |

### 4. Tax Year Summary

Each tax year should show:
- Total receipts count
- Total expenses count
- Total claimed amount
- Date range (first to last receipt)
- Status badge

### 5. UI Components

**Tax Year Selector:**
- Dropdown in header/sidebar
- Shows current year by default
- Quick access to switch years

**Tax Year Settings Page:**
- List of all tax years
- Create new year
- Close/reopen years
- View summaries

**Receipt List Filtering:**
- Filter by tax year (default: current year)
- Show year indicator on receipts

### 6. Business Rules

1. **Year Assignment**: Receipts auto-assign to tax year based on receipt date
2. **Closed Year Protection**: Cannot create/edit/delete receipts in closed years
3. **Year Creation**: Years created automatically when first receipt added
4. **Default Year**: Show current calendar year by default

## Technical Specifications

### Schema Changes

```prisma
enum TaxYearStatus {
  OPEN
  CLOSED
  ARCHIVED
}

model TaxYear {
  id        Int           @id @default(autoincrement())
  year      Int
  status    TaxYearStatus @default(OPEN)
  closedAt  DateTime?     @map("closed_at")
  notes     String?
  userId    String        @map("user_id")
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")

  user      User          @relation(fields: [userId], references: [id])
  receipts  Receipt[]

  @@unique([userId, year])
  @@map("tax_year")
}
```

### New Files

| File | Description |
|------|-------------|
| `src/app/api/tax-years/route.ts` | List/create tax years |
| `src/app/api/tax-years/[id]/route.ts` | Get/update tax year |
| `src/app/api/tax-years/[id]/close/route.ts` | Close tax year |
| `src/app/api/tax-years/[id]/reopen/route.ts` | Reopen tax year |
| `src/app/settings/tax-years/page.tsx` | Tax year management UI |
| `src/components/tax-year/TaxYearSelector.tsx` | Year selector component |
| `src/components/tax-year/TaxYearCard.tsx` | Year summary card |

### API Response: Tax Year with Summary

```typescript
interface TaxYearWithSummary {
  id: number;
  year: number;
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  closedAt: string | null;
  notes: string | null;
  summary: {
    receiptCount: number;
    expenseCount: number;
    totalAmount: number;
    dateRange: {
      earliest: string | null;
      latest: string | null;
    };
  };
}
```

## User Flow

### Closing a Tax Year

1. User navigates to Settings > Tax Years
2. Selects year to close
3. Reviews summary
4. Confirms closure
5. Year status changes to CLOSED
6. Receipts for that year become read-only

### Reopening a Tax Year

1. User navigates to Settings > Tax Years
2. Selects closed year
3. Clicks "Reopen"
4. Confirms action
5. Year status changes to OPEN
6. Receipts can be modified again

## Success Criteria

1. Users can view receipts filtered by tax year
2. Users can close tax years to prevent modifications
3. Users can reopen tax years if needed
4. Summary statistics display correctly
5. Closed years show visual indicator
6. API prevents modifications to closed years

---

*Created: 2025-12-05*
