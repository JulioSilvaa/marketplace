-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "space_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripe_customer_id" TEXT;

-- CreateIndex
CREATE INDEX "subscriptions_space_id_idx" ON "subscriptions"("space_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
