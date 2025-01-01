/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Product";

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

-- CreateIndex
CREATE INDEX "productReviewIndex" ON "product_reviews"("productId");

-- CreateIndex
CREATE INDEX "sellerReviewIndex" ON "product_reviews"("sellerId");

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
