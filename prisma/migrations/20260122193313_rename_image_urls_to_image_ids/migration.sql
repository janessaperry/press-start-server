/*
  Note:
  - rename columns in games table
*/
-- AlterTable
ALTER TABLE "games"
    RENAME COLUMN "cover_url" TO "cover_id";
ALTER TABLE "games"
    RENAME COLUMN "esrb_thumbnail_url" TO "esrb_thumbnail_id";