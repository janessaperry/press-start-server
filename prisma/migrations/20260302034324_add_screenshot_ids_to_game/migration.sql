-- AlterTable
ALTER TABLE "games" ADD COLUMN     "screenshot_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
