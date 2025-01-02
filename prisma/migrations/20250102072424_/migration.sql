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

-- CreateTable
CREATE TABLE "products" (
    "productId" SERIAL NOT NULL,
    "category" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "stockSize" INTEGER NOT NULL,
    "isVerifiedProduct" BOOLEAN NOT NULL,
    "suggestedMaxPrice" INTEGER,
    "description" TEXT NOT NULL,
    "videoUrl" TEXT,
    "location" TEXT NOT NULL,
    "deliveryChargeInside" INTEGER NOT NULL,
    "deliveryChargeOutside" INTEGER NOT NULL,
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
    "rating" INTEGER NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNo_key" ON "users"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "userIndex" ON "users"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phoneNo_key" ON "contacts"("phoneNo");

-- CreateIndex
CREATE INDEX "contactIndex" ON "contacts"("phoneNo");

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

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_meta" ADD CONSTRAINT "product_meta_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
