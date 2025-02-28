import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';

// POST /api/price-proofs/[id]/validate
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const priceProof = await prisma.productPriceProof.update({
      where: {
        id: params.id
      },
      data: {
        validated: true,
        validatedAt: new Date()
      }
    });

    return NextResponse.json(priceProof);
  } catch (error) {
    console.error('Error validating price proof:', error);
    return NextResponse.json(
      { error: 'Failed to validate price proof' },
      { status: 500 }
    );
  }
} 