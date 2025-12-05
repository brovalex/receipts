# Phase 1: Kinde Authentication PRD

## Overview

Implement user authentication using Kinde to secure the application and prepare for multi-tenancy in Phase 2.

## Goals

1. Secure all application routes with authentication
2. Provide seamless login/logout experience
3. Store user information for multi-tenancy
4. Maintain existing functionality for authenticated users

## Non-Goals

- User management UI (Kinde handles this)
- Role-based access control (future enhancement)
- Social login providers (start with email/password)

## Background

### Why Kinde?
- Modern authentication provider with excellent Next.js support
- Free tier suitable for initial deployment
- Built-in user management dashboard
- Easy migration path to enterprise features if needed
- SDK handles tokens, sessions, and refresh automatically

### Kinde Next.js App Router Integration
Kinde provides `@kinde-oss/kinde-auth-nextjs` SDK which:
- Handles OAuth 2.0 PKCE flow
- Provides React hooks for auth state
- Includes middleware for route protection
- Works with Next.js App Router

## Requirements

### 1. Kinde Setup

**Kinde Dashboard Configuration:**
- Create application (Regular Web App)
- Configure callback URLs:
  - Login: `http://localhost:3000/api/auth/kinde_callback`
  - Logout: `http://localhost:3000`
- Enable email/password authentication
- Note client credentials

### 2. Environment Variables

```env
KINDE_CLIENT_ID=<from_kinde_dashboard>
KINDE_CLIENT_SECRET=<from_kinde_dashboard>
KINDE_ISSUER_URL=https://<your_domain>.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000
```

### 3. Authentication Routes

Create API routes for Kinde callbacks:

```
src/app/api/auth/
├── [kindeAuth]/
│   └── route.ts    # Handles login, logout, callback, register
```

### 4. Middleware

Create middleware to protect routes:

```typescript
// middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth;

export const config = {
  matcher: [
    // Protect all routes except public ones
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 5. UI Components

**Login Button Component:**
```typescript
// src/components/auth/LoginButton.tsx
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function LoginButton() {
  return <LoginLink className="...">Sign In</LoginLink>;
}
```

**User Menu Component:**
```typescript
// src/components/auth/UserMenu.tsx
// Show user avatar/name and logout option
```

**Protected Route Wrapper:**
```typescript
// src/components/auth/ProtectedRoute.tsx
// Client-side check with redirect
```

### 6. Header Integration

Update Header component to show:
- Login button (when logged out)
- User menu with name/avatar (when logged in)
- Logout option

### 7. API Route Protection

Update all API routes to:
1. Check authentication status
2. Return 401 if not authenticated
3. Pass user info to handlers

```typescript
// Example protected API route
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!await isAuthenticated()) {
    return ApiErrors.unauthorized();
  }

  const user = await getUser();
  // ... rest of handler
}
```

### 8. User Context Provider

Create React context for user state:

```typescript
// src/contexts/UserContext.tsx
export const UserProvider = ({ children }) => {
  // Provide user state to components
};
```

## Technical Specifications

### New Dependencies
```json
{
  "dependencies": {
    "@kinde-oss/kinde-auth-nextjs": "^2.3.0"
  }
}
```

### New Files

| File | Description |
|------|-------------|
| `src/app/api/auth/[kindeAuth]/route.ts` | Auth callback handler |
| `middleware.ts` | Route protection |
| `src/components/auth/LoginButton.tsx` | Login UI |
| `src/components/auth/LogoutButton.tsx` | Logout UI |
| `src/components/auth/UserMenu.tsx` | User dropdown |
| `src/contexts/UserContext.tsx` | Auth context |
| `src/lib/auth.ts` | Auth helper functions |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/env.ts` | Add Kinde env vars |
| `src/components/layout/Header.tsx` | Add auth UI |
| `src/app/api/*/route.ts` | Add auth checks |

## User Flow

### Login Flow
1. User visits any protected page
2. Middleware redirects to Kinde login
3. User authenticates with Kinde
4. Kinde redirects to callback URL
5. SDK creates session
6. User redirected to original page

### Logout Flow
1. User clicks logout
2. SDK clears local session
3. Redirect to Kinde logout
4. Kinde clears its session
5. Redirect to home page

## Testing

### Manual Testing
- [ ] Can access login page
- [ ] Can create new account
- [ ] Can login with email/password
- [ ] Redirects to original page after login
- [ ] Can logout
- [ ] Protected routes redirect to login
- [ ] API routes return 401 when not authenticated
- [ ] User info displayed in header

### Edge Cases
- [ ] Session expiration handling
- [ ] Multiple tabs behavior
- [ ] Deep linking to protected routes

## Security Considerations

1. **Environment Variables**: Never commit secrets
2. **CSRF Protection**: Handled by Kinde SDK
3. **Session Management**: Use HTTP-only cookies
4. **Token Storage**: SDK handles securely

## Rollback Plan

If issues arise:
1. Remove middleware (allows all access)
2. Remove auth checks from API routes
3. Keep Kinde SDK installed for easy re-enable

## Success Criteria

1. Users can register and login
2. Protected routes require authentication
3. User info available throughout app
4. Logout works correctly
5. No degradation of existing features

## Future Enhancements (Out of Scope)

- Social login (Google, GitHub)
- Multi-factor authentication
- Role-based permissions
- Organization/team support
- SSO for enterprise

---

*Created: 2025-12-05*
