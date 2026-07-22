-- CreateTable
CREATE TABLE "igdb_token" (
    "id" SERIAL NOT NULL,
    "access_token" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "igdb_token_pkey" PRIMARY KEY ("id")
);
