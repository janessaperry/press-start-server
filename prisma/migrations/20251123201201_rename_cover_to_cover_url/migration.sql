/*
  This migration renames the column `cover` to `cover_url` on the `games` table.
  No data will be lost.
*/
-- AlterTable
ALTER TABLE "games"
    RENAME COLUMN "cover" TO "cover_url";