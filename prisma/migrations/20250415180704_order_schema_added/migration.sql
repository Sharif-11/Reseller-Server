/*
  Warnings:

  - Made the column `shopName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'approved', 'processing', 'shipped', 'cancelled', 'returned', 'rejected', 'refunded', 'completed');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "shopName" SET NOT NULL;

-- CreateTable
CREATE TABLE "orders" (
    "orderId" SERIAL NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'pending',
    "orderCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderUpdatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledByUser" BOOLEAN NOT NULL DEFAULT false,
    "sellerId" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerPhoneNo" TEXT NOT NULL,
    "sellerVerified" BOOLEAN NOT NULL,
    "sellerShopName" TEXT NOT NULL,
    "sellerBalance" DECIMAL(15,2) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhoneNo" TEXT NOT NULL,
    "customerZilla" TEXT NOT NULL,
    "customerUpazilla" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "comments" TEXT,
    "courierName" TEXT,
    "trackingURL" TEXT,
    "deliveryCharge" DECIMAL(15,2) NOT NULL,
    "deliveryChargePaidBySeller" DECIMAL(15,2),
    "isDeliveryChargePaidBySeller" BOOLEAN NOT NULL DEFAULT false,
    "transactionId" TEXT,
    "transactionVerified" BOOLEAN DEFAULT false,
    "sellerWalletName" TEXT,
    "sellerWalletPhoneNo" TEXT,
    "adminWalletId" INTEGER,
    "adminWalletName" TEXT,
    "adminWalletPhoneNo" TEXT,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "totalCommission" DECIMAL(15,2) NOT NULL,
    "actualCommission" DECIMAL(15,2) NOT NULL,
    "totalProductBasePrice" DECIMAL(15,2) NOT NULL,
    "totalProductSellingPrice" DECIMAL(15,2) NOT NULL,
    "totalProductQuantity" INTEGER NOT NULL,
    "totalAmountPaidByCustomer" DECIMAL(15,2),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "order_products" (
    "orderProductId" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productImage" TEXT NOT NULL,
    "productBasePrice" DECIMAL(15,2) NOT NULL,
    "productSellingPrice" DECIMAL(15,2) NOT NULL,
    "productQuantity" INTEGER NOT NULL,
    "productTotalBasePrice" DECIMAL(15,2) NOT NULL,
    "productTotalSellingPrice" DECIMAL(15,2) NOT NULL,
    "selectedOptions" TEXT,

    CONSTRAINT "order_products_pkey" PRIMARY KEY ("orderProductId")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_transactionId_key" ON "orders"("transactionId");

-- AddForeignKey
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;
