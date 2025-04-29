/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Payment";

-- CreateTable
CREATE TABLE "payments" (
    "paymentId" SERIAL NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "orderId" INTEGER,
    "withdrawId" INTEGER,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paymentType" "PaymentType" NOT NULL,
    "sender" "Role" NOT NULL,
    "adminWalletId" INTEGER NOT NULL,
    "adminWalletName" TEXT NOT NULL,
    "adminWalletPhoneNo" TEXT NOT NULL,
    "sellerWalletName" TEXT NOT NULL,
    "sellerWalletPhoneNo" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerPhoneNo" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("paymentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");
