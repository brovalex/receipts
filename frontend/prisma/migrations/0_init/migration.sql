-- CreateTable
CREATE TABLE "expense" (
    "id" SERIAL NOT NULL,
    "price_each" DECIMAL NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "receipt_id" INTEGER NOT NULL,
    "receipt_text_id" INTEGER,
    "product_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_file" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "receipt_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DECIMAL NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "reference_item_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_price_proof" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "quantity" DECIMAL,
    "unit_of_measure" TEXT,
    "price" DECIMAL,
    "price_per_weight" DECIMAL,
    "reference_url" TEXT,
    "screenshot" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "validated" BOOLEAN,
    "validated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "reference_item_id" INTEGER,

    CONSTRAINT "product_price_proof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_text" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "boundingBox" TEXT,
    "image_file_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipt_text_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "price_per_weight" DECIMAL NOT NULL,
    "reference_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expense_receipt_text_id_key" ON "expense"("receipt_text_id");

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "Expense_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "Expense_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "Expense_receipt_text_id_fkey" FOREIGN KEY ("receipt_text_id") REFERENCES "receipt_text"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_file" ADD CONSTRAINT "Image_file_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "Product_referenceItemId_fkey" FOREIGN KEY ("reference_item_id") REFERENCES "reference_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_price_proof" ADD CONSTRAINT "product_price_proof_reference_item_id_fkey" FOREIGN KEY ("reference_item_id") REFERENCES "reference_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_text" ADD CONSTRAINT "ReceiptText_image_file_id_fkey" FOREIGN KEY ("image_file_id") REFERENCES "image_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

