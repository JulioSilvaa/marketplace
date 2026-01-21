/*
  Warnings:

  - You are about to drop the column `facebook_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `instagram_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "review_replies_listing_id_idx";

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "contact_whatsapp_alternative" TEXT,
ADD COLUMN     "specifications" JSONB,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coupon_code" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "facebook_url",
DROP COLUMN "instagram_url",
DROP COLUMN "whatsapp";

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_email_idx" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "spaces_category_id_idx" ON "spaces"("category_id");

-- CreateIndex
CREATE INDEX "spaces_state_idx" ON "spaces"("state");

-- CreateIndex
CREATE INDEX "spaces_neighborhood_idx" ON "spaces"("neighborhood");

-- CreateIndex
CREATE INDEX "spaces_price_per_day_idx" ON "spaces"("price_per_day");

-- CreateIndex
CREATE INDEX "spaces_price_per_weekend_idx" ON "spaces"("price_per_weekend");

-- CreateIndex
CREATE INDEX "spaces_created_at_idx" ON "spaces"("created_at");

-- CreateIndex
CREATE INDEX "spaces_city_state_idx" ON "spaces"("city", "state");

-- CreateIndex
CREATE INDEX "subscriptions_created_at_idx" ON "subscriptions"("created_at");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
