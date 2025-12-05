import { getOptionalUser, KindeUser } from './auth';
import { getOrCreateUser, DbUser } from './user';
import { isKindeConfigured } from './env';

/**
 * User context for API routes
 * Provides the authenticated user and helper for building queries
 */
export interface UserContext {
  /** Whether authentication is configured */
  isAuthEnabled: boolean;
  /** The Kinde user (if authenticated) */
  kindeUser: KindeUser | null;
  /** The database user (if authenticated) */
  dbUser: DbUser | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Get user context for API routes
 * Handles both authenticated and unauthenticated scenarios
 */
export async function getUserContext(): Promise<UserContext> {
  const isAuthEnabled = isKindeConfigured();

  if (!isAuthEnabled) {
    return {
      isAuthEnabled: false,
      kindeUser: null,
      dbUser: null,
      isAuthenticated: false,
    };
  }

  const kindeUser = await getOptionalUser();

  if (!kindeUser) {
    return {
      isAuthEnabled: true,
      kindeUser: null,
      dbUser: null,
      isAuthenticated: false,
    };
  }

  const dbUser = await getOrCreateUser(kindeUser);

  return {
    isAuthEnabled: true,
    kindeUser,
    dbUser,
    isAuthenticated: true,
  };
}

/**
 * Build a where clause for filtering by userId
 * Returns {} if auth is disabled (shows all data)
 * Returns { userId: dbUser.id } if authenticated
 * Returns { userId: 'none' } if auth enabled but not authenticated (returns nothing)
 */
export function buildUserWhereClause(ctx: UserContext): { userId?: string } {
  if (!ctx.isAuthEnabled) {
    // Dev mode - show all data
    return {};
  }

  if (!ctx.dbUser) {
    // Auth enabled but not authenticated - return impossible condition
    return { userId: 'no-user-authenticated' };
  }

  return { userId: ctx.dbUser.id };
}

/**
 * Check if user owns a resource
 */
export function userOwnsResource(ctx: UserContext, resourceUserId: string | null): boolean {
  if (!ctx.isAuthEnabled) {
    // Dev mode - allow all
    return true;
  }

  if (!ctx.dbUser) {
    return false;
  }

  // Allow access if resource has no owner (legacy data) or user matches
  return resourceUserId === null || resourceUserId === ctx.dbUser.id;
}
