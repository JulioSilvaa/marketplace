-- AlterTable: Change spaces.status from Int to String
-- Step 1: Add temporary column with String type
ALTER TABLE "spaces" ADD COLUMN "status_new" TEXT NOT NULL DEFAULT 'active';

-- Step 2: Migrate existing data (0 -> 'active', 1 -> 'inactive')
UPDATE "spaces" 
SET "status_new" = CASE 
  WHEN "status" = 0 THEN 'active'
  WHEN "status" = 1 THEN 'inactive'
  ELSE 'active'
END;

-- Step 3: Drop old status column
ALTER TABLE "spaces" DROP COLUMN "status";

-- Step 4: Rename new column to status
ALTER TABLE "spaces" RENAME COLUMN "status_new" TO "status";
