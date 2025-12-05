# Architecture Decisions Record

## ADR-001: Authentication Provider - Kinde

**Date**: 2025-12-05
**Status**: Accepted (per user requirement)

### Context
The application needs user authentication for multi-tenancy. Options considered:
- NextAuth.js (Auth.js)
- Clerk
- Kinde
- Supabase Auth
- Custom implementation

### Decision
Use **Kinde** as the authentication provider.

### Rationale
- User specifically requested Kinde
- Good Next.js App Router support
- Generous free tier
- Built-in user management
- Simple SDK integration

### Consequences
- Need to create Kinde account and configure application
- Will use @kinde-oss/kinde-auth-nextjs SDK
- Environment variables for Kinde configuration required

---

## ADR-002: Multi-Tenancy Strategy - Row-Level Security

**Date**: 2025-12-05
**Status**: Accepted

### Context
Need to isolate user data. Options:
1. Separate databases per user
2. Separate schemas per user
3. Row-level security (userId column)

### Decision
Use **row-level security** with userId column on all user-owned tables.

### Rationale
- Simplest to implement and maintain
- Works well with Prisma
- Single database easier to manage
- Appropriate for expected scale

### Consequences
- All user-owned models need userId field
- All queries must filter by userId
- Existing data needs migration strategy

---

## ADR-003: Tax Year Model Design

**Date**: 2025-12-05
**Status**: Proposed

### Context
Users need to close tax years to prevent accidental modifications and generate reports.

### Decision
Create explicit TaxYear model with status (OPEN, CLOSED, ARCHIVED).

### Rationale
- Explicit status tracking
- Can add metadata (closed date, notes)
- Clear relationship to receipts
- Supports reopening if needed

### Consequences
- Receipts must belong to a TaxYear
- UI needs year selection/management
- Need to handle year transitions

---

## ADR-004: Reference Items - Global vs User-Owned

**Date**: 2025-12-05
**Status**: Needs Discussion

### Context
Reference items contain base prices for calculating tax deductions. Should these be:
1. Global (shared by all users)
2. User-owned (private to each user)
3. Hybrid (system defaults + user customization)

### Decision
**TBD** - Need to understand business requirements better.

### Options Analysis
| Option | Pros | Cons |
|--------|------|------|
| Global | Less duplication, admin can update | Users can't customize |
| User-owned | Full control, privacy | Duplication, more management |
| Hybrid | Best of both | Most complex |

### Recommendation
Start with **user-owned** for simplicity, consider hybrid later if needed.

---

## ADR-005: API Response Format Standardization

**Date**: 2025-12-05
**Status**: Proposed

### Context
Current API responses are inconsistent. Need standard format for:
- Success responses
- Error responses
- Pagination
- Validation errors

### Decision
Adopt consistent response format:

```typescript
// Success
{
  data: T | T[],
  meta?: {
    pagination?: { page, limit, total, totalPages }
  }
}

// Error
{
  error: {
    code: string,
    message: string,
    details?: Record<string, string[]>
  }
}
```

### Consequences
- Need to update all API routes
- Frontend needs to handle new format
- Better error handling on frontend possible
