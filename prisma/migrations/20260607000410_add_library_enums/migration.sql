/*
  Warnings:

  - You are about to drop the column `libraryStatus` on the `user_games` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LibraryStatus" AS ENUM ('PLAYING', 'WANT_TO_PLAY', 'PLAYED', 'ON_PAUSE', 'WISHLIST');

-- CreateEnum
CREATE TYPE "LibraryFormat" AS ENUM ('PHYSICAL', 'DIGITAL');

-- AlterTable
ALTER TABLE "user_games" DROP COLUMN "libraryStatus",
ADD COLUMN     "library_console_id" INTEGER,
ADD COLUMN     "library_format" "LibraryFormat",
ADD COLUMN     "library_status" "LibraryStatus";

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_library_console_id_fkey" FOREIGN KEY ("library_console_id") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
