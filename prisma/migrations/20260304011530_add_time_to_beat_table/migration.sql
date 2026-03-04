-- CreateTable
CREATE TABLE "time_to_beat" (
    "id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "hastily" INTEGER,
    "normally" INTEGER,
    "completely" INTEGER,
    "count" INTEGER,
    "igdb_checksum" TEXT NOT NULL,

    CONSTRAINT "time_to_beat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_to_beat_game_id_key" ON "time_to_beat"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "time_to_beat_igdb_checksum_key" ON "time_to_beat"("igdb_checksum");

-- AddForeignKey
ALTER TABLE "time_to_beat" ADD CONSTRAINT "time_to_beat_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
