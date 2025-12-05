import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { getOptionalUser } from '@/lib/auth';

/**
 * GET /api/receipts
 * Returns all receipts with their expenses
 * Protected by middleware - requires authentication when Kinde is configured
 *
 * TODO (Phase 2): Filter by user ID for multi-tenancy
 */
export async function GET() {
  try {
    // Get current user (will be used for filtering in Phase 2)
    const user = await getOptionalUser();

    // TODO (Phase 2): Add where clause to filter by userId
    const receipts = await prisma.receipt.findMany({
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