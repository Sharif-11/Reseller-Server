-- CreateTable
CREATE TABLE "wallet_contacts" (
    "id" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "totalOTP" INTEGER NOT NULL DEFAULT 0,
    "otp" TEXT,
    "otpCreatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_contacts_phoneNo_key" ON "wallet_contacts"("phoneNo");

-- CreateIndex
CREATE INDEX "walletContactIndex" ON "wallet_contacts"("phoneNo");
