/*
  Warnings:

  - A unique constraint covering the columns `[walletName,walletPhoneNo]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "wallets_walletName_walletPhoneNo_key" ON "wallets"("walletName", "walletPhoneNo");
