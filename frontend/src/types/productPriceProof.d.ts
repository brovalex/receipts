import { ProductPriceProof as PrismaProductPriceProof, ReferenceItem } from '@prisma/client';

export interface ProductPriceProofWithRelationships extends PrismaProductPriceProof {
  referenceItem: ReferenceItem;
}