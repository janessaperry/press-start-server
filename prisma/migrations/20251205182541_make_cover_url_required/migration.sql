/*
  Warnings:

  - Made the column `cover_url` on table `games` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "games" ALTER COLUMN "cover_url" SET NOT NULL;
