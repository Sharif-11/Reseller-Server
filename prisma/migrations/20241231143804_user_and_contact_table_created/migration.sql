-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Seller');

-- CreateTable
CREATE TABLE "users" (
    "userId" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zilla" TEXT NOT NULL,
    "upazilla" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "referralCode" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "shopName" TEXT,
    "nomineePhone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'Seller',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "totalOTP" INTEGER NOT NULL DEFAULT 0,
    "otp" TEXT NOT NULL,
    "otpCreatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNo_key" ON "users"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phoneNo_key" ON "contacts"("phoneNo");
