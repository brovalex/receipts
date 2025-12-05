import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";

/**
 * Authentication middleware
 *
 * Protects all routes except:
 * - /api/auth/* - Auth endpoints
 * - /_next/* - Next.js internals
 * - /favicon.ico - Favicon
 * - Static files
 *
 * When Kinde is not configured, all routes are accessible (development mode)
 */
export default function middleware(request: NextRequest) {
  // Check if Kinde is configured
  const isKindeConfigured = !!(
    process.env.KINDE_CLIENT_ID &&
    process.env.KINDE_CLIENT_SECRET &&
    process.env.KINDE_ISSUER_URL
  );

  // If Kinde is not configured, allow all requests (development mode)
  if (!isKindeConfigured) {
    return NextResponse.next();
  }

  // Use Kinde's withAuth middleware
  return withAuth(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|screenshots).*)",
  ],
};
