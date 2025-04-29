/*
  Warnings:

  - Added the required column `actualAmount` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "actualAmount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "transactionFee" DECIMAL(15,2),
ALTER COLUMN "withdrawId" SET DATA TYPE TEXT,
ALTER COLUMN "adminWalletId" DROP NOT NULL;
