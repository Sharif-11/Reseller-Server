/*
  Warnings:

  - A unique constraint covering the columns `[userId,walletName]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "wallet-contacts" (
    "id" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "totalOTP" INTEGER NOT NULL DEFAULT 0,
    "otp" TEXT NOT NULL,
    "otpCreatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet-contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet-contacts_phoneNo_key" ON "wallet-contacts"("phoneNo");

-- CreateIndex
CREATE INDEX "walletContactIndex" ON "wallet-contacts"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_walletName_key" ON "wallets"("userId", "walletName");
