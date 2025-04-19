// app/api/receipt/route.js

// model Receipt {
//   id              Int       @id @default(autoincrement())
//   expenses        Expense[]
//   imageFiles      ImageFile[]
  
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { receiptDate } = body;
    
    // Create data object with optional receiptDate
    const data: any = {};
    
    // Add receiptDate if provided
    if (receiptDate) {
      // Parse the date if it's a string
      data.receiptDate = typeof receiptDate === 'string' 
        ? new Date(receiptDate) 
        : receiptDate;
        
      // Validate the date
      if (data.receiptDate instanceof Date && isNaN(data.receiptDate.getTime())) {
        return NextResponse.json({ error: 'Invalid receipt date format' }, { status: 400 });
      }
    }
    
    // Create a new Receipt
    const newReceipt = await prisma.receipt.create({
      data
    });
    
    return NextResponse.json(newReceipt, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json({ error: 'Failed to create receipt: ' + error.message }, { status: 500 });
  }
}

// Add PUT endpoint for updating receipt
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptId, receiptDate } = body;
    
    // Validate input
    if (!receiptId) {
      return NextResponse.json({ error: 'Receipt ID is required' }, { status: 400 });
    }
    
    // Parse the date if it's a string
    let parsedDate = receiptDate;
    if (typeof receiptDate === 'string') {
      parsedDate = new Date(receiptDate);
      
      // Check if the date is valid
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
    }
    
    // Update the receipt
    const updatedReceipt = await prisma.receipt.update({
      where: {
        id: typeof receiptId === 'string' ? parseInt(receiptId) : receiptId
      },
      data: {
        receiptDate: parsedDate
      }
    });
    
    return NextResponse.json(updatedReceipt, { status: 200 });
  } catch (error) {
    console.error('Error updating receipt:', error);  
    return NextResponse.json({ error: 'Failed to update receipt: ' + error.message }, { status: 500 });
  }
}
