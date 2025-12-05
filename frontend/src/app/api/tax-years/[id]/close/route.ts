import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiErrors } from '@/lib/api-response';
import { getUserContext } from '@/lib/user-context';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tax-years/[id]/close
 * Close a tax year to prevent further modifications
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

    if (taxYear.status === 'CLOSED') {
      return ApiErrors.badRequest('Tax year is already closed');
    }

    if (taxYear.status === 'ARCHIVED') {
      return ApiErrors.badRequest('Cannot close an archived tax year');
    }

    const updated = await prisma.taxYear.update({
      where: { id: taxYearId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
