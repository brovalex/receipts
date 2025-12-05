import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiErrors } from '@/lib/api-response';
import { getUserContext, buildUserWhereClause } from '@/lib/user-context';
import { z } from 'zod';

const createTaxYearSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  notes: z.string().optional(),
});

/**
 * GET /api/tax-years
 * List all tax years for the authenticated user with summaries
 */
export async function GET() {
  try {
    const ctx = await getUserContext();

    if (ctx.isAuthEnabled && !ctx.dbUser) {
      return ApiErrors.unauthorized();
    }

    const whereClause = buildUserWhereClause(ctx);

    const taxYears = await prisma.taxYear.findMany({
      where: whereClause,
      orderBy: { year: 'desc' },
      include: {
        receipts: {
          include: {
            expenses: true,
          },
        },
      },
    });

    // Calculate summaries for each tax year
    const taxYearsWithSummaries = taxYears.map((taxYear) => {
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

      return {
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
    });

    return successResponse(taxYearsWithSummaries);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tax-years
 * Create a new tax year
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();

    if (!ctx.dbUser) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const data = createTaxYearSchema.parse(body);

    // Check if year already exists
    const existing = await prisma.taxYear.findUnique({
      where: {
        userId_year: {
          userId: ctx.dbUser.id,
          year: data.year,
        },
      },
    });

    if (existing) {
      return ApiErrors.badRequest(`Tax year ${data.year} already exists`);
    }

    const taxYear = await prisma.taxYear.create({
      data: {
        year: data.year,
        notes: data.notes,
        userId: ctx.dbUser.id,
      },
    });

    return successResponse(taxYear, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
