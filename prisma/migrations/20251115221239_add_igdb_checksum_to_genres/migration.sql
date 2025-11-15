/*
  Warnings:

  - A unique constraint covering the columns `[igdb_checksum]` on the table `genres` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `igdb_checksum` to the `genres` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "genres" ADD COLUMN     "igdb_checksum" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "genres_igdb_checksum_key" ON "genres"("igdb_checksum");
