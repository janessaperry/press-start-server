/*
  Warnings:

  - Made the column `abbreviation` on table `platforms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "platforms" ALTER COLUMN "abbreviation" SET NOT NULL;
