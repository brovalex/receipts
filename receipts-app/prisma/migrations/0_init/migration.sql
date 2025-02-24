-- CreateTable
CREATE TABLE "Receipt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "priceEach" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "receiptId" INTEGER NOT NULL,
    "receiptTextId" INTEGER,
    "productId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_receiptTextId_fkey" FOREIGN KEY ("receiptTextId") REFERENCES "ReceiptText" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "referenceItemId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_referenceItemId_fkey" FOREIGN KEY ("referenceItemId") REFERENCES "ReferenceItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReceiptText" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "boundingBox" TEXT,
    "imageFileId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReceiptText_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "ImageFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImageFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "receiptId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImageFile_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferenceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "pricePerWeight" REAL NOT NULL,
    "referenceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductPriceProof" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "quantity" TEXT,
    "unitOfMeasure" TEXT,
    "price" REAL,
    "pricePerWeight" REAL,
    "referenceURL" TEXT,
    "screenshot" TEXT,
    "createdAt" TEXT,
    "reference_item_id" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "Expense_receiptTextId_key" ON "Expense"("receiptTextId");

