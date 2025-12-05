import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function GET() {
  try {
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