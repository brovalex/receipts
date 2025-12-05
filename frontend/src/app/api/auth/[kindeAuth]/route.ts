import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * Kinde authentication handler
 * This handles all auth routes: login, logout, callback, register
 *
 * Routes handled:
 * - /api/auth/login - Redirects to Kinde login
 * - /api/auth/logout - Logs out and redirects
 * - /api/auth/register - Redirects to Kinde registration
 * - /api/auth/kinde_callback - OAuth callback handler
 */
export const GET = handleAuth();
