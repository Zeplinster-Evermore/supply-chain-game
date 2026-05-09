-- DropForeignKey
ALTER TABLE "public"."Game" DROP CONSTRAINT "Game_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_gameId_fkey";

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GameGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
