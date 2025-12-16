-- CreateIndex
CREATE INDEX "spaces_owner_id_idx" ON "spaces"("owner_id");

-- CreateIndex
CREATE INDEX "spaces_status_idx" ON "spaces"("status");

-- CreateIndex
CREATE INDEX "spaces_city_idx" ON "spaces"("city");

-- CreateIndex
CREATE INDEX "spaces_title_idx" ON "spaces"("title");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
