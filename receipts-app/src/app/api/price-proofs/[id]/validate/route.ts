import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';

// POST /api/price-proofs/[id]/validate
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Starting validation request for price proof:', params.id);
    // Convert string ID to integer
    const proofId = parseInt(params.id, 10);
    if (isNaN(proofId)) {
      console.log('Invalid ID - not a number:', params.id);
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    };
    // Validate input
    const body = await request.json();
    console.log('Received body:', body);

    if (typeof body.validated !== 'boolean') {
      console.log('Invalid input - validated is not boolean:', body.validated);
      return NextResponse.json(
        { error: 'validated field must be a boolean' },
        { status: 400 }
      );
    }

    const { validated } = body;

    // Validate ID exists
    const existingProof = await prisma.productPriceProof.findUnique({
      where: { id: proofId }
    });

    if (!existingProof) {
      return NextResponse.json(
        { error: 'Price proof not found' },
        { status: 404 }
      );
    }

    const priceProof = await prisma.productPriceProof.update({
      where: { id: proofId },
      data: {
        validated,
        validatedAt: validated ? new Date() : null
      }
    });

    return NextResponse.json(priceProof);
  } catch (error) {
    console.error('Error validating price proof:', {
      id: proofId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to validate price proof' },
      { status: 500 }
    );
  }
} 