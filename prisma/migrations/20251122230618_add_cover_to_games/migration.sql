/*
  Warnings:

  - You are about to drop the `game` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "game_genres" DROP CONSTRAINT "game_genres_gameId_fkey";

-- DropForeignKey
ALTER TABLE "game_platforms" DROP CONSTRAINT "game_platforms_gameId_fkey";

-- DropForeignKey
ALTER TABLE "game_themes" DROP CONSTRAINT "game_themes_gameId_fkey";

-- DropTable
DROP TABLE "game";

-- CreateTable
CREATE TABLE "games" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "summary" TEXT,
    "release_date" TIMESTAMP(3),
    "total_rating" INTEGER,
    "total_rating_count" INTEGER,
    "igdb_checksum" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- AddForeignKey
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_themes" ADD CONSTRAINT "game_themes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_platforms" ADD CONSTRAINT "game_platforms_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
