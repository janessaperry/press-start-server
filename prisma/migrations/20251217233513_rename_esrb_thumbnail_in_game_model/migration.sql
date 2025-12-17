/*
  Note:
  - rename column in games table
*/
-- AlterTable
ALTER TABLE "games"
    RENAME COLUMN "esrb_thumbnail" TO "esrb_thumbnail_url";