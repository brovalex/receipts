import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        expenses: true,
      },
    });
    
    return NextResponse.json(receipts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
} 