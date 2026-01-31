-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "type" "ListingType" NOT NULL DEFAULT 'SPACE';
