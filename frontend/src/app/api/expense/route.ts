// app/api/expense/route.js

// model Expense {
//   id        Int   @id @default(autoincrement())
  // priceEach Float
  // quantity  Float

  // receiptId       Int
//   receipt         Receipt       @relation(fields: [receiptId], references: [id])
  // receiptTextId   Int?           @unique
//   receiptText     ReceiptText?   @relation(fields: [receiptTextId], references: [id])
  // referenceItemId Int           @unique
//   referenceItem   ReferenceItem @relation(fields: [referenceItemId], references: [id])

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { priceEach, quantity, receiptId, receiptTextId, productId } = await req.json();

    // Create a new Expense
    const newExpense = await prisma.expense.create({
      data: {
        "priceEach": priceEach,
        "quantity": quantity,
        "receipt": { connect: { id: receiptId } },
        "receiptText": { connect: { id: receiptTextId } },
        "product": { connect: { id: productId } },
      },
      include: {
        product: true,
      },
    });

    // Fetch the reference item for productId
    if (newExpense && newExpense.product) {
      const referenceItem = await prisma.referenceItem.findUnique({
        where: { id: newExpense.product.referenceItemId },
      });
    
      if (referenceItem) {
        newExpense.product.referenceItem = referenceItem;
      }
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt text:', error);
    return NextResponse.json({ error: 'Failed to create expense '+error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, priceEach, quantity, receiptId, receiptTextId, productId } = await req.json();

    // Update the Expense
    const updatedExpense = await prisma.expense.update({
      where: { id: id },
      data: {
        priceEach: priceEach,
        quantity: quantity,
        receipt: receiptId ? { connect: { id: receiptId } } : undefined,
        receiptText: receiptTextId ? { connect: { id: receiptTextId } } : undefined,
        product: productId ? { connect: { id: productId } } : undefined,
      },
      include: {
        product: true,
      },
    });

    // Fetch the reference item for productId
    if (updatedExpense && updatedExpense.product) {
      const referenceItem = await prisma.referenceItem.findUnique({
        where: { id: updatedExpense.product.referenceItemId },
      });
    
      if (referenceItem) {
        updatedExpense.product.referenceItem = referenceItem;
      }
    }

    return NextResponse.json(updatedExpense, { status: 200 });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense '+error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    // Delete the Expense
    await prisma.expense.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense '+error }, { status: 500 });
  }
}
