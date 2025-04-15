/*
  Warnings:

  - The `selectedOptions` column on the `order_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "order_products" DROP COLUMN "selectedOptions",
ADD COLUMN     "selectedOptions" JSONB;
