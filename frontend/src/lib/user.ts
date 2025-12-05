import { prisma } from './prisma';
import { KindeUser } from './auth';

/**
 * User record from database
 */
export interface DbUser {
  id: string;
  kindeId: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sync user from Kinde to database
 * Creates new user if doesn't exist, updates if exists
 */
export async function syncUser(kindeUser: KindeUser): Promise<DbUser> {
  if (!kindeUser.email) {
    throw new Error('User email is required');
  }

  const name = [kindeUser.given_name, kindeUser.family_name]
    .filter(Boolean)
    .join(' ')
    .trim() || null;

  return prisma.user.upsert({
    where: { kindeId: kindeUser.id },
    update: {
      email: kindeUser.email,
      name,
    },
    create: {
      kindeId: kindeUser.id,
      email: kindeUser.email,
      name,
    },
  });
}

/**
 * Get user by Kinde ID
 */
export async function getUserByKindeId(kindeId: string): Promise<DbUser | null> {
  return prisma.user.findUnique({
    where: { kindeId },
  });
}

/**
 * Get user by database ID
 */
export async function getUserById(id: string): Promise<DbUser | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Get or create user from Kinde user
 * Use this in API routes to ensure user exists
 */
export async function getOrCreateUser(kindeUser: KindeUser): Promise<DbUser> {
  // First try to find existing user
  const existingUser = await getUserByKindeId(kindeUser.id);
  if (existingUser) {
    return existingUser;
  }

  // Create new user
  return syncUser(kindeUser);
}
