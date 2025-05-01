/*
  Warnings:

  - You are about to drop the column `cashOnDeliveryAmount` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "cashOnDeliveryAmount",
ADD COLUMN     "cashOnAmount" DECIMAL(15,2);
