/*
  Warnings:

  - Changed the type of `igdb_game_id` on the `user_games` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "user_games" DROP COLUMN "igdb_game_id",
ADD COLUMN     "igdb_game_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "games_name_idx" ON "games"("name");

-- CreateIndex
CREATE INDEX "games_release_date_idx" ON "games"("release_date");

-- CreateIndex
CREATE INDEX "games_created_at_idx" ON "games"("created_at");

-- CreateIndex
CREATE INDEX "games_game_type_id_idx" ON "games"("game_type_id");

-- CreateIndex
CREATE INDEX "games_esrb_rating_idx" ON "games"("esrb_rating");

-- CreateIndex
CREATE INDEX "platforms_platform_family_id_idx" ON "platforms"("platform_family_id");

-- CreateIndex
CREATE INDEX "time_to_beat_normally_idx" ON "time_to_beat"("normally");

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_igdb_game_id_fkey" FOREIGN KEY ("igdb_game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
