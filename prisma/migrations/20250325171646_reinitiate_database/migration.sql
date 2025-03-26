-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Seller');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Credit', 'Debit');

-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('pending', 'completed', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "userId" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zilla" TEXT NOT NULL,
    "upazilla" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "referralCode" TEXT,
    "referredByPhone" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "shopName" TEXT,
    "nomineePhone" TEXT,
    "forgotPasswordSmsCount" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'Seller',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "wallets" (
    "walletId" SERIAL NOT NULL,
    "walletName" TEXT NOT NULL,
    "walletPhoneNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userPhoneNo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("walletId")
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

-- CreateTable
CREATE TABLE "products" (
    "productId" SERIAL NOT NULL,
    "category" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "basePrice" DECIMAL(15,2) NOT NULL,
    "stockSize" INTEGER NOT NULL DEFAULT 0,
    "isVerifiedProduct" BOOLEAN NOT NULL,
    "suggestedMaxPrice" DECIMAL(15,2) NOT NULL,
    "description" TEXT NOT NULL,
    "videoUrl" TEXT,
    "location" TEXT NOT NULL,
    "deliveryChargeInside" DECIMAL(15,2) NOT NULL,
    "deliveryChargeOutside" DECIMAL(15,2) NOT NULL,
    "published" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "reviewId" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sellerId" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "sellerPhone" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("reviewId")
);

-- CreateTable
CREATE TABLE "product_images" (
    "imageId" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("imageId")
);

-- CreateTable
CREATE TABLE "product_meta" (
    "metaId" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_meta_pkey" PRIMARY KEY ("metaId")
);

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

-- CreateTable
CREATE TABLE "commissions" (
    "id" SERIAL NOT NULL,
    "startPrice" DECIMAL(15,2) NOT NULL,
    "endPrice" DECIMAL(15,2) NOT NULL,
    "commission" DECIMAL(15,2) NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraw_requests" (
    "withdrawId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPhoneNo" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "walletName" TEXT NOT NULL,
    "walletPhoneNo" TEXT NOT NULL,
    "transactionId" TEXT,
    "transactionPhoneNo" TEXT,
    "remarks" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" "WithdrawStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "withdraw_requests_pkey" PRIMARY KEY ("withdrawId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNo_key" ON "users"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "userIndex" ON "users"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_walletName_walletPhoneNo_key" ON "wallets"("walletName", "walletPhoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phoneNo_key" ON "contacts"("phoneNo");

-- CreateIndex
CREATE INDEX "contactIndex" ON "contacts"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_contacts_phoneNo_key" ON "wallet_contacts"("phoneNo");

-- CreateIndex
CREATE INDEX "walletContactIndex" ON "wallet_contacts"("phoneNo");

-- CreateIndex
CREATE INDEX "productReviewIndex" ON "product_reviews"("productId");

-- CreateIndex
CREATE INDEX "sellerReviewIndex" ON "product_reviews"("sellerId");

-- CreateIndex
CREATE INDEX "productImageIndex" ON "product_images"("productId");

-- CreateIndex
CREATE INDEX "productMetaIndex" ON "product_meta"("productId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "product_meta_productId_key_value_key" ON "product_meta"("productId", "key", "value");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transactionId_key" ON "transactions"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_startPrice_endPrice_level_key" ON "commissions"("startPrice", "endPrice", "level");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredByPhone_fkey" FOREIGN KEY ("referredByPhone") REFERENCES "users"("phoneNo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_meta" ADD CONSTRAINT "product_meta_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
