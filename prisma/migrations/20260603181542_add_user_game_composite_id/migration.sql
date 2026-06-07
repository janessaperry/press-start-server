/*
  Warnings:

  - A unique constraint covering the columns `[user_id,igdb_game_id]` on the table `user_games` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_games_user_id_igdb_game_id_key" ON "user_games"("user_id", "igdb_game_id");
