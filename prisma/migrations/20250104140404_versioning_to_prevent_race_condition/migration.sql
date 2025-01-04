/*
  Warnings:

  - Made the column `suggestedMaxPrice` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Credit', 'Debit');

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "suggestedMaxPrice" SET NOT NULL,
ALTER COLUMN "suggestedMaxPrice" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "deliveryChargeInside" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "deliveryChargeOutside" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userPhoneNo" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "reference" TEXT,
    "referralLevel" INTEGER,
    "remarks" TEXT,
    "paymentMethod" TEXT,
    "paymentPhoneNo" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
