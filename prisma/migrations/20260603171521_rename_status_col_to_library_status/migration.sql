/*
  Note:
  - rename status column in user_games table
*/
-- AlterTable
ALTER TABLE "user_games" RENAME COLUMN "status"to "libraryStatus";
