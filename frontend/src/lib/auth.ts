import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { UnauthorizedError } from "./errors";

/**
 * Get the current authenticated user from server context
 * Throws UnauthorizedError if not authenticated
 */
export async function requireAuth() {
  const { isAuthenticated, getUser } = getKindeServerSession();

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    throw new UnauthorizedError("Authentication required");
  }

  const user = await getUser();
  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  return user;
}

/**
 * Get the current user if authenticated, or null if not
 * Does not throw - useful for pages that work for both auth states
 */
export async function getOptionalUser() {
  const { isAuthenticated, getUser } = getKindeServerSession();

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return null;
  }

  return await getUser();
}

/**
 * Check if user is authenticated without getting user details
 */
export async function isUserAuthenticated(): Promise<boolean> {
  const { isAuthenticated } = getKindeServerSession();
  return await isAuthenticated();
}

/**
 * User type from Kinde
 */
export interface KindeUser {
  id: string;
  email: string | null;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
}

/**
 * Get user display name (falls back to email)
 */
export function getUserDisplayName(user: KindeUser): string {
  if (user.given_name && user.family_name) {
    return `${user.given_name} ${user.family_name}`;
  }
  if (user.given_name) {
    return user.given_name;
  }
  if (user.email) {
    return user.email;
  }
  return "User";
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: KindeUser): string {
  if (user.given_name && user.family_name) {
    return `${user.given_name[0]}${user.family_name[0]}`.toUpperCase();
  }
  if (user.given_name) {
    return user.given_name[0].toUpperCase();
  }
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  return "U";
}
