/*
  Warnings:

  - Made the column `game_type_id` on table `games` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_game_type_id_fkey";

-- AlterTable
ALTER TABLE "games" ALTER COLUMN "game_type_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "game_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
