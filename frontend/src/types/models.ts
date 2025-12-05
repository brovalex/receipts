/**
 * Base model types matching Prisma schema
 * These are standalone types that don't require Prisma client generation
 */

export interface Receipt {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  reviewed: boolean | null;
  receiptDate: Date | string | null;
}

export interface Expense {
  id: number;
  priceEach: number | string;
  quantity: number | string;
  receiptId: number;
  receiptTextId: number | null;
  productId: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Product {
  id: number;
  name: string;
  weight: number | string;
  unitOfMeasure: string;
  referenceItemId: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ReferenceItem {
  id: number;
  name: string;
  quantity: number | string;
  unitOfMeasure: string;
  price: number | string;
  pricePerWeight: number | string;
  referenceUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ImageFile {
  id: number;
  url: string;
  receiptId: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ReceiptText {
  id: number;
  text: string;
  boundingBox: string | null;
  imageFileId: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProductPriceProof {
  id: number;
  name: string | null;
  quantity: number | string | null;
  unitOfMeasure: string | null;
  price: number | string | null;
  pricePerWeight: number | string | null;
  referenceUrl: string | null;
  screenshot: string | null;
  createdAt: Date | string | null;
  validated: boolean | null;
  validatedAt: Date | string | null;
  referenceItemId: number | null;
}

export interface ProductConversion {
  id: number;
  referenceItemId: number | null;
  fromUnit: string;
  toUnit: string;
  factor: number | string;
}

// Types with relationships

export interface ProductWithRelationships extends Product {
  referenceItem?: ReferenceItem;
  expenses?: Expense[];
}

export interface ExpenseWithRelationships extends Expense {
  product?: ProductWithRelationships | null;
  receipt?: Receipt;
  receiptText?: ReceiptText | null;
}

export interface ReceiptTextWithRelationships extends ReceiptText {
  expense?: Expense | null;
  imageFile?: ImageFile;
}

export interface ImageFileWithRelationships extends ImageFile {
  receipt?: Receipt | null;
  receiptTexts?: ReceiptTextWithRelationships[];
}

export interface ReceiptWithRelationships extends Receipt {
  expenses?: ExpenseWithRelationships[];
  imageFiles?: ImageFileWithRelationships[];
}

export interface ProductPriceProofWithRelationships extends ProductPriceProof {
  referenceItem?: ReferenceItem | null;
}

export interface ReferenceItemWithRelationships extends ReferenceItem {
  products?: Product[];
  productPriceProofs?: ProductPriceProof[];
}
