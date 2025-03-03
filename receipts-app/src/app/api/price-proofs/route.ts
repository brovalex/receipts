import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';

// GET /api/price-proofs
export async function GET() {
  try {
    const priceProofs = await prisma.productPriceProof.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        referenceItem: {
            select: { name: true }  // Select only the name field
        }
      }
    });

    return NextResponse.json(priceProofs);
  } catch (error) {
    console.error('Error fetching price proofs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price proofs' },
      { status: 500 }
    );
  }
}
