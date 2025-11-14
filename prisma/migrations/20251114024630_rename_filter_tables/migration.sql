/*
  Warnings:

  - You are about to drop the `GameGenre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GamePlatform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameTheme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Genre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Platform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Theme` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameGenre" DROP CONSTRAINT "GameGenre_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GameGenre" DROP CONSTRAINT "GameGenre_genreId_fkey";

-- DropForeignKey
ALTER TABLE "GamePlatform" DROP CONSTRAINT "GamePlatform_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GamePlatform" DROP CONSTRAINT "GamePlatform_platformId_fkey";

-- DropForeignKey
ALTER TABLE "GameTheme" DROP CONSTRAINT "GameTheme_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GameTheme" DROP CONSTRAINT "GameTheme_themeId_fkey";

-- DropTable
DROP TABLE "GameGenre";

-- DropTable
DROP TABLE "GamePlatform";

-- DropTable
DROP TABLE "GameTheme";

-- DropTable
DROP TABLE "Genre";

-- DropTable
DROP TABLE "Platform";

-- DropTable
DROP TABLE "Theme";

-- CreateTable
CREATE TABLE "genres" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_genres" (
    "gameId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "game_genres_pkey" PRIMARY KEY ("gameId","genreId")
);

-- CreateTable
CREATE TABLE "game_themes" (
    "gameId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,

    CONSTRAINT "game_themes_pkey" PRIMARY KEY ("gameId","themeId")
);

-- CreateTable
CREATE TABLE "game_platforms" (
    "gameId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,

    CONSTRAINT "game_platforms_pkey" PRIMARY KEY ("gameId","platformId")
);

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "themes_name_key" ON "themes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_name_key" ON "platforms"("name");

-- CreateIndex
CREATE INDEX "game_genres_genreId_idx" ON "game_genres"("genreId");

-- CreateIndex
CREATE INDEX "game_themes_themeId_idx" ON "game_themes"("themeId");

-- CreateIndex
CREATE INDEX "game_platforms_platformId_idx" ON "game_platforms"("platformId");

-- AddForeignKey
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_themes" ADD CONSTRAINT "game_themes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_themes" ADD CONSTRAINT "game_themes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_platforms" ADD CONSTRAINT "game_platforms_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_platforms" ADD CONSTRAINT "game_platforms_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
