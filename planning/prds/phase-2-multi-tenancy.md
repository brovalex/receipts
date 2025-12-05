# Phase 2: Multi-Tenancy PRD

## Overview

Add multi-tenancy support so each user sees only their own data. This involves adding a User model linked to Kinde and adding userId to all user-owned models.

## Goals

1. Create User model synced with Kinde authentication
2. Add userId foreign key to all user-owned models
3. Filter all API queries by authenticated user
4. Handle data isolation properly

## Non-Goals

- Organization/team support (future enhancement)
- Sharing data between users
- Admin access to all data

## Requirements

### 1. Database Schema Changes

**New User Model:**
```prisma
model User {
  id        String   @id @default(cuid())
  kindeId   String   @unique @map("kinde_id")
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  receipts         Receipt[]
  products         Product[]
  referenceItems   ReferenceItem[]

  @@map("user")
}
```

**Modified Models (add userId):**
- Receipt: add `userId String` and relation
- Product: add `userId String` and relation
- ReferenceItem: add `userId String` and relation (user's custom items)

### 2. User Sync on Login

When a user logs in via Kinde:
1. Check if User exists with that kindeId
2. If not, create new User record
3. Update email/name if changed
4. Return User record for session

### 3. API Route Updates

All API routes must:
1. Get authenticated user
2. Filter queries by userId
3. Validate ownership on updates/deletes
4. Associate new records with userId

### 4. Migration Strategy

For existing data:
1. Create User model
2. Add nullable userId columns
3. Create default user for existing data (or leave null for demo data)
4. Make userId required after migration

## Technical Specifications

### Schema Changes

```prisma
model User {
  id        String   @id @default(cuid())
  kindeId   String   @unique @map("kinde_id")
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  receipts       Receipt[]
  products       Product[]
  referenceItems ReferenceItem[]

  @@map("user")
}

model Receipt {
  // ... existing fields
  userId    String?  @map("user_id")
  user      User?    @relation(fields: [userId], references: [id])
}

model Product {
  // ... existing fields
  userId    String?  @map("user_id")
  user      User?    @relation(fields: [userId], references: [id])
}

model ReferenceItem {
  // ... existing fields
  userId    String?  @map("user_id")
  user      User?    @relation(fields: [userId], references: [id])
}
```

### New Files

| File | Description |
|------|-------------|
| `src/lib/user.ts` | User sync and retrieval helpers |
| `src/app/api/user/route.ts` | User API endpoint |

### Modified Files

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add User model, userId to models |
| `src/app/api/receipts/route.ts` | Filter by userId |
| `src/app/api/receipt/[id]/route.ts` | Filter by userId |
| `src/app/api/expense/route.ts` | Validate receipt ownership |
| `src/app/api/product/route.ts` | Filter by userId |
| `src/app/api/referenceItem/route.ts` | Filter by userId |

### User Sync Helper

```typescript
// src/lib/user.ts
export async function syncUser(kindeUser: KindeUser): Promise<User> {
  return prisma.user.upsert({
    where: { kindeId: kindeUser.id },
    update: {
      email: kindeUser.email,
      name: `${kindeUser.given_name} ${kindeUser.family_name}`.trim() || null,
    },
    create: {
      kindeId: kindeUser.id,
      email: kindeUser.email!,
      name: `${kindeUser.given_name} ${kindeUser.family_name}`.trim() || null,
    },
  });
}
```

## Testing

### Manual Testing
- [ ] New user gets User record created
- [ ] Existing user's data is preserved
- [ ] User A cannot see User B's receipts
- [ ] User A cannot modify User B's data
- [ ] API returns 404 for other user's resources

### Edge Cases
- [ ] User with no email (should not happen with Kinde)
- [ ] Concurrent user creation
- [ ] User deletion (future consideration)

## Security Considerations

1. **Data Isolation**: All queries MUST filter by userId
2. **Ownership Validation**: Updates/deletes must verify ownership
3. **No Leakage**: Error messages must not reveal other users' data

## Success Criteria

1. Each user sees only their own data
2. New users start with empty data
3. Existing functionality preserved
4. No data leakage between users

---

*Created: 2025-12-05*
