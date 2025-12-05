import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiErrors } from '@/lib/api-response';
import { getUserContext } from '@/lib/user-context';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tax-years/[id]/reopen
 * Reopen a closed tax year to allow modifications
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getUserContext();
    const { id } = await params;
    const taxYearId = parseInt(id);

    if (!ctx.dbUser) {
      return ApiErrors.unauthorized();
    }

    if (isNaN(taxYearId)) {
      return ApiErrors.badRequest('Invalid tax year ID');
    }

    const taxYear = await prisma.taxYear.findUnique({
      where: { id: taxYearId },
    });

    if (!taxYear || taxYear.userId !== ctx.dbUser.id) {
      return ApiErrors.notFound('Tax year');
    }

    if (taxYear.status === 'OPEN') {
      return ApiErrors.badRequest('Tax year is already open');
    }

    const updated = await prisma.taxYear.update({
      where: { id: taxYearId },
      data: {
        status: 'OPEN',
        closedAt: null,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
