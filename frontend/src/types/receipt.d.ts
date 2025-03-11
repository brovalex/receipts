import { Receipt as PrismaReceipt } from '@prisma/client';
import { ImageFileWithRelationships } from './imageFile.d';
import { ExpenseWithRelationships } from './expense.d';

export interface ReceiptWithRelationships extends PrismaReceipt {
  imageFiles: ImageFileWithRelationships[];
  expenses: ExpenseWithRelationships[];
}