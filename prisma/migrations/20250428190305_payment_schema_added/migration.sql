-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DuePayment', 'OrderPayment', 'WithdrawPayment');

-- CreateTable
CREATE TABLE "Payment" (
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
    "transactionId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");
