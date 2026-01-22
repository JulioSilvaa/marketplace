-- AlterTable
ALTER TABLE "spaces" ADD COLUMN "price_unit" TEXT DEFAULT 'day';

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "allowed_pricing_models" JSONB;
