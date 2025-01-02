/*
  Warnings:

  - You are about to alter the column `balance` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(15,2);
