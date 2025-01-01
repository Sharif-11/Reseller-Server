-- CreateTable
CREATE TABLE "Product" (
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

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

ALTER SEQUENCE "Product_productId_seq" RESTART WITH 101;

