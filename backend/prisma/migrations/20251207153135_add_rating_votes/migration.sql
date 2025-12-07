-- CreateTable
CREATE TABLE "rating_votes" (
    "id" TEXT NOT NULL,
    "rating_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "voteType" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rating_votes_rating_id_user_id_key" ON "rating_votes"("rating_id", "user_id");

-- AddForeignKey
ALTER TABLE "rating_votes" ADD CONSTRAINT "rating_votes_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "ratings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_votes" ADD CONSTRAINT "rating_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
