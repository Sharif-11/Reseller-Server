/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `withdraw_requests` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `withdraw_requests` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - Added the required column `walletName` to the `withdraw_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `walletPhoneNo` to the `withdraw_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "withdraw_requests" DROP COLUMN "paymentMethod",
ADD COLUMN     "walletName" TEXT NOT NULL,
ADD COLUMN     "walletPhoneNo" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);
