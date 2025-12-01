-- AlterTable
ALTER TABLE "games"
    ADD COLUMN "game_type_id" INTEGER,
    ALTER COLUMN "cover_url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "game_types"
(
    "id"            INTEGER NOT NULL,
    "label"         TEXT    NOT NULL,
    "igdb_checksum" TEXT    NOT NULL,

    CONSTRAINT "game_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "games"
    ADD CONSTRAINT "games_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "game_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
