/*
  Warnings:

  - You are about to drop the `game_platforms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `platforms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "game_platforms" DROP CONSTRAINT "game_platforms_gameId_fkey";

-- DropForeignKey
ALTER TABLE "game_platforms" DROP CONSTRAINT "game_platforms_platformId_fkey";

-- DropTable
DROP TABLE "game_platforms";

-- DropTable
DROP TABLE "platforms";

-- CreateTable
CREATE TABLE "consoles" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "igdb_checksum" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_consoles" (
    "gameId" INTEGER NOT NULL,
    "consoleId" INTEGER NOT NULL,

    CONSTRAINT "game_consoles_pkey" PRIMARY KEY ("gameId","consoleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "consoles_name_key" ON "consoles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "consoles_igdb_checksum_key" ON "consoles"("igdb_checksum");

-- CreateIndex
CREATE INDEX "game_consoles_consoleId_idx" ON "game_consoles"("consoleId");

-- AddForeignKey
ALTER TABLE "game_consoles" ADD CONSTRAINT "game_consoles_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_consoles" ADD CONSTRAINT "game_consoles_consoleId_fkey" FOREIGN KEY ("consoleId") REFERENCES "consoles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
