import { z } from 'zod';

/**
 * Environment variable validation schema
 * Add new environment variables here as the project grows
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Kinde Auth - required for authentication
  // These are optional during build but required at runtime for auth
  KINDE_CLIENT_ID: z.string().optional(),
  KINDE_CLIENT_SECRET: z.string().optional(),
  KINDE_ISSUER_URL: z.string().optional(),
  KINDE_SITE_URL: z.string().optional(),
  KINDE_POST_LOGOUT_REDIRECT_URL: z.string().optional(),
  KINDE_POST_LOGIN_REDIRECT_URL: z.string().optional(),
});

/**
 * Check if Kinde auth is configured
 */
export function isKindeConfigured(): boolean {
  return !!(
    process.env.KINDE_CLIENT_ID &&
    process.env.KINDE_CLIENT_SECRET &&
    process.env.KINDE_ISSUER_URL
  );
}

/**
 * Validate and export environment variables
 * This will throw at startup if required vars are missing
 */
function validateEnv() {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    return {} as z.infer<typeof envSchema>;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Environment validation failed:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
