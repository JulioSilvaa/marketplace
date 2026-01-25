/*
  Warnings:

  - You are about to drop the column `allowed_pricing_models` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "allowed_pricing_models",
ADD COLUMN     "type" "ListingType" NOT NULL DEFAULT 'SPACE';

-- CreateTable
CREATE TABLE "pricing_models" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,

    CONSTRAINT "pricing_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_categoriesTopricing_models" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_categoriesTopricing_models_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "pricing_models_key_key" ON "pricing_models"("key");

-- CreateIndex
CREATE INDEX "pricing_models_key_idx" ON "pricing_models"("key");

-- CreateIndex
CREATE INDEX "_categoriesTopricing_models_B_index" ON "_categoriesTopricing_models"("B");

-- CreateIndex
CREATE INDEX "spaces_status_city_category_id_idx" ON "spaces"("status", "city", "category_id");

-- CreateIndex
CREATE INDEX "spaces_status_price_per_day_idx" ON "spaces"("status", "price_per_day");

-- AddForeignKey
ALTER TABLE "_categoriesTopricing_models" ADD CONSTRAINT "_categoriesTopricing_models_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoriesTopricing_models" ADD CONSTRAINT "_categoriesTopricing_models_B_fkey" FOREIGN KEY ("B") REFERENCES "pricing_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
