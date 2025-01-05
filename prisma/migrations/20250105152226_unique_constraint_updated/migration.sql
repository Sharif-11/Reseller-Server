/*
  Warnings:

  - A unique constraint covering the columns `[startPrice,endPrice,level]` on the table `commissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "commissions_startPrice_endPrice_key";

-- CreateIndex
CREATE UNIQUE INDEX "commissions_startPrice_endPrice_level_key" ON "commissions"("startPrice", "endPrice", "level");
