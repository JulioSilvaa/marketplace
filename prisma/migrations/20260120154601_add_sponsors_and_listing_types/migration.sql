-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SPACE', 'SERVICE', 'EQUIPMENT');

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "type" "ListingType" NOT NULL DEFAULT 'SPACE';

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "banner_desktop_url" TEXT NOT NULL,
    "banner_mobile_url" TEXT NOT NULL,
    "link_url" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "display_location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "clicks_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sponsor_status_idx" ON "Sponsor"("status");

-- CreateIndex
CREATE INDEX "Sponsor_tier_idx" ON "Sponsor"("tier");

-- CreateIndex
CREATE INDEX "Sponsor_display_location_idx" ON "Sponsor"("display_location");

-- CreateIndex
CREATE INDEX "spaces_type_idx" ON "spaces"("type");
