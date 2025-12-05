# Phase 0: Foundation & Cleanup PRD

## Overview

Prepare the codebase for major changes by upgrading dependencies, improving code quality, and establishing patterns that will be used throughout the upgrade.

## Goals

1. Update dependencies to latest stable versions
2. Add proper environment variable validation
3. Standardize API response formats
4. Create reusable error handling utilities
5. Establish base layout structure
6. Remove technical debt

## Non-Goals

- Adding new features
- Changing existing functionality
- Database schema changes

## Requirements

### 1. Dependency Upgrades

**Current Issues:**
- Some packages may be outdated
- Missing validation libraries
- No utility packages for common tasks

**Actions:**
- [ ] Audit current dependencies
- [ ] Upgrade Next.js if needed
- [ ] Add `zod` for schema validation
- [ ] Check for security vulnerabilities

### 2. Environment Variable Validation

**Current Issues:**
- No validation of environment variables
- Could fail at runtime if missing

**Implementation:**
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Kinde vars will be added in Phase 1
});

export const env = envSchema.parse(process.env);
```

### 3. API Response Standardization

**Current State:**
- Inconsistent response formats
- No standard error structure
- No pagination support

**Target Format:**
```typescript
// Success response
interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Error response
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

**Implementation:**
- Create helper functions for consistent responses
- Update all API routes to use new format

### 4. Error Handling Utilities

**Files to Create:**
```
src/lib/
├── api-response.ts    # Response helper functions
├── errors.ts          # Custom error classes
└── validation.ts      # Zod schema helpers
```

### 5. Base Layout Structure

**Current State:**
- Minimal layout.tsx
- No navigation
- No consistent page structure

**Target:**
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx (placeholder)
│   │   └── MainLayout.tsx
│   └── ui/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
```

**Note:** Full navigation will be added in Phase 5; this phase just creates the structure.

### 6. Code Cleanup

**Tasks:**
- [ ] Remove unused imports
- [ ] Fix TypeScript `any` types where possible
- [ ] Remove commented-out code
- [ ] Standardize file naming conventions

## Technical Specifications

### New Dependencies
```json
{
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

### File Changes

| File | Change Type | Description |
|------|-------------|-------------|
| package.json | Modify | Add zod, update versions |
| src/lib/env.ts | Create | Environment validation |
| src/lib/api-response.ts | Create | Response helpers |
| src/lib/errors.ts | Create | Custom error classes |
| src/components/layout/Header.tsx | Create | Basic header component |
| src/components/layout/MainLayout.tsx | Create | Layout wrapper |
| src/components/ui/LoadingSpinner.tsx | Create | Reusable spinner |

### API Route Updates

All API routes will be updated to use new response format:

```typescript
// Before
return NextResponse.json(data);

// After
return successResponse(data);
```

## Testing

- [ ] Verify all existing functionality still works
- [ ] Test environment variable validation
- [ ] Ensure API responses follow new format
- [ ] Check for TypeScript errors

## Success Criteria

1. `npm run build` succeeds with no errors
2. All environment variables validated at startup
3. API responses follow consistent format
4. No TypeScript `any` types in new code
5. Base layout structure in place

## Rollback Plan

Changes in this phase are additive and low-risk. If issues arise:
1. Revert to previous commit
2. Keep existing response formats
3. Remove new dependencies

---

*Created: 2025-12-05*
