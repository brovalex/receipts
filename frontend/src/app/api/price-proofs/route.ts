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

// POST /api/price-proofs
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Create new price proof in database
    const priceProof = await prisma.productPriceProof.create({
      data: {
        name: body.name || null,
        quantity: body.quantity ? body.quantity.toString() : null,
        unitOfMeasure: body.unitOfMeasure || null,
        price: body.price ? body.price.toString() : null,
        pricePerWeight: body.pricePerWeight ? body.pricePerWeight.toString() : null,
        referenceUrl: body.referenceUrl || null,
        screenshot: body.screenshot || null,
        validated: body.validated || false,
        referenceItemId: body.referenceItemId || null
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: priceProof 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating price proof:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create price proof',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}