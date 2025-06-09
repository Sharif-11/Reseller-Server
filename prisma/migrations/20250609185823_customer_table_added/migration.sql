-- CreateEnum
CREATE TYPE "CustomerRole" AS ENUM ('Customer');

-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'CustomerOrderPayment';

-- AlterTable
ALTER TABLE "order_products" ADD COLUMN     "customerOrderOrderId" INTEGER;

-- CreateTable
CREATE TABLE "customers" (
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhoneNo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "CustomerRole" NOT NULL DEFAULT 'Customer',
    "sellerId" TEXT NOT NULL,
    "sellerCode" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "customer_orders" (
    "orderId" SERIAL NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'pending',
    "orderCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderUpdatedAt" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhoneNo" TEXT NOT NULL,
    "customerZilla" TEXT NOT NULL,
    "customerUpazilla" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "comments" TEXT,
    "sellerId" TEXT NOT NULL,
    "sellerCode" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerPhone" TEXT NOT NULL,
    "courierName" TEXT,
    "trackingURL" TEXT,
    "deliveryCharge" DECIMAL(15,2) NOT NULL,
    "transactionId" TEXT,
    "transactionVerified" BOOLEAN DEFAULT false,
    "customerWalletName" TEXT,
    "customerWalletPhoneNo" TEXT,
    "adminWalletId" INTEGER NOT NULL,
    "adminWalletName" TEXT,
    "adminWalletPhoneNo" TEXT,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "totalProductQuantity" INTEGER NOT NULL,
    "totalProductBasePrice" DECIMAL(15,2) NOT NULL,
    "totalProductSellingPrice" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "customer_orders_pkey" PRIMARY KEY ("orderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerPhoneNo_key" ON "customers"("customerPhoneNo");

-- CreateIndex
CREATE INDEX "customerPhoneIndex" ON "customers"("customerPhoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "customer_orders_transactionId_key" ON "customer_orders"("transactionId");

-- AddForeignKey
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_customerOrderOrderId_fkey" FOREIGN KEY ("customerOrderOrderId") REFERENCES "customer_orders"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;
