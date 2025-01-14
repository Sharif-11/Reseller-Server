-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "withdraw_requests" (
    "withdrawId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPhoneNo" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "remarks" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" "WithdrawStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "withdraw_requests_pkey" PRIMARY KEY ("withdrawId")
);
