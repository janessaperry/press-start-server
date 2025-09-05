/*
  Warnings:

  - You are about to drop the column `hashed_pw` on the `users` table. All the data in the column will be lost.
  - Added the required column `hashed_password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "hashed_pw",
ADD COLUMN     "hashed_password" TEXT NOT NULL;
