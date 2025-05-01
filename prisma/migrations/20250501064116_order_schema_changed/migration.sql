/*
  Warnings:

  - The values [approved] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cancelledByUser` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryChargeMustBePaidBySeller` on the `orders` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('unverified', 'pending', 'processing', 'shipped', 'cancelled', 'returned', 'rejected', 'refunded', 'completed');
ALTER TABLE "orders" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "orderStatus" TYPE "OrderStatus_new" USING ("orderStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "cancelledByUser",
DROP COLUMN "deliveryChargeMustBePaidBySeller",
ADD COLUMN     "cancelledBySeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cashOnDeliveryAmount" DECIMAL(15,2);
