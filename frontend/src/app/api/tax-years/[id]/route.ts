import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiErrors } from '@/lib/api-response';
import { getUserContext } from '@/lib/user-context';
import { z } from 'zod';

const updateTaxYearSchema = z.object({
  notes: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tax-years/[id]
 * Get a single tax year with summary
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getUserContext();
    const { id } = await params;
    const taxYearId = parseInt(id);

    if (isNaN(taxYearId)) {
      return ApiErrors.badRequest('Invalid tax year ID');
    }

    const taxYear = await prisma.taxYear.findUnique({
      where: { id: taxYearId },
      include: {
        receipts: {
          include: {
            expenses: true,
          },
        },
      },
    });

    if (!taxYear) {
      return ApiErrors.notFound('Tax year');
    }

    // Check ownership
    if (ctx.isAuthEnabled && taxYear.userId !== ctx.dbUser?.id) {
      return ApiErrors.notFound('Tax year');
    }

    // Calculate summary
    const receiptCount = taxYear.receipts.length;
    const expenseCount = taxYear.receipts.reduce(
      (sum, r) => sum + r.expenses.length,
      0
    );
    const totalAmount = taxYear.receipts.reduce((sum, r) => {
      return (
        sum +
        r.expenses.reduce((expSum, exp) => {
          return expSum + Number(exp.priceEach) * Number(exp.quantity);
        }, 0)
      );
    }, 0);

    const dates = taxYear.receipts
      .map((r) => r.receiptDate)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    const result = {
      id: taxYear.id,
      year: taxYear.year,
      status: taxYear.status,
      closedAt: taxYear.closedAt,
      notes: taxYear.notes,
      userId: taxYear.userId,
      createdAt: taxYear.createdAt,
      updatedAt: taxYear.updatedAt,
      summary: {
        receiptCount,
        expenseCount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        dateRange: {
          earliest: dates[0] || null,
          latest: dates[dates.length - 1] || null,
        },
      },
    };

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/tax-years/[id]
 * Update a tax year (notes only, use close/reopen for status)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const data = updateTaxYearSchema.parse(body);

    const updated = await prisma.taxYear.update({
      where: { id: taxYearId },
      data: {
        notes: data.notes,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/tax-years/[id]
 * Delete a tax year (only if no receipts)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      include: { receipts: { select: { id: true } } },
    });

    if (!taxYear || taxYear.userId !== ctx.dbUser.id) {
      return ApiErrors.notFound('Tax year');
    }

    if (taxYear.receipts.length > 0) {
      return ApiErrors.badRequest(
        'Cannot delete tax year with receipts. Remove receipts first.'
      );
    }

    await prisma.taxYear.delete({
      where: { id: taxYearId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
