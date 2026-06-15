/*
  Warnings:

  - You are about to drop the column `library_console_id` on the `user_games` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_games" DROP CONSTRAINT "user_games_library_console_id_fkey";

-- AlterTable
ALTER TABLE "user_games" DROP COLUMN "library_console_id",
ADD COLUMN     "library_platform_id" INTEGER;

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_library_platform_id_fkey" FOREIGN KEY ("library_platform_id") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
