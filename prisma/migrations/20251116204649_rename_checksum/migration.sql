/*
This migration renames the column `checksum` to `igdb_checksum` on the `game` table.
  No data will be lost.
*/
-- AlterTable
ALTER TABLE game
    RENAME COLUMN checksum TO igdb_checksum;
