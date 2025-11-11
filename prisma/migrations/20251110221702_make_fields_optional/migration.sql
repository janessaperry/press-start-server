-- AlterTable
ALTER TABLE "game" ALTER COLUMN "summary" DROP NOT NULL,
ALTER COLUMN "release_date" DROP NOT NULL,
ALTER COLUMN "total_rating" DROP NOT NULL,
ALTER COLUMN "total_rating_count" DROP NOT NULL;
