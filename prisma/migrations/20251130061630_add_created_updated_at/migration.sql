/*
  Warnings:

  - A unique constraint covering the columns `[igdb_checksum]` on the table `game_types` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `game_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_types"
    ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "game_types_igdb_checksum_key"
    ON "game_types" ("igdb_checksum");