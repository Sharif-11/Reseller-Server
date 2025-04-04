/*
  Warnings:

  - Added the required column `actualAmount` to the `withdraw_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionFee` to the `withdraw_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "withdraw_requests" ADD COLUMN     "actualAmount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "transactionFee" DECIMAL(15,2) NOT NULL;
