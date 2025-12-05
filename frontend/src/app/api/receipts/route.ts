import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { getOptionalUser } from '@/lib/auth';
import { getOrCreateUser } from '@/lib/user';
import { isKindeConfigured } from '@/lib/env';

/**
 * GET /api/receipts
 * Returns all receipts with their expenses
 * Protected by middleware - requires authentication when Kinde is configured
 * Filters by userId for multi-tenancy
 */
export async function GET() {
  try {
    const kindeUser = await getOptionalUser();

    // Build where clause based on auth state
    let whereClause = {};

    if (isKindeConfigured() && kindeUser) {
      // User is authenticated - get or create DB user and filter by userId
      const dbUser = await getOrCreateUser(kindeUser);
      whereClause = { userId: dbUser.id };
    } else if (isKindeConfigured()) {
      // Auth configured but no user - return empty (shouldn't happen due to middleware)
      return successResponse([]);
    }
    // If Kinde not configured, show all data (dev mode)

    const receipts = await prisma.receipt.findMany({
      where: whereClause,
      include: {
        expenses: true,
      },
      orderBy: {
        receiptDate: 'desc',
      },
    });

    return successResponse(receipts);
  } catch (error) {
    return handleApiError(error);
  }
} 