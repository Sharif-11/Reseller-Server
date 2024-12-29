/*
  Warnings:

  - The primary key for the `contacts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `contacts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Seller');

-- AlterTable
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_pkey",
DROP COLUMN "id";

-- CreateTable
CREATE TABLE "users" (
    "userId" TEXT NOT NULL,
    "mobileNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zilla" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sellerCode" TEXT,
    "shopName" TEXT,
    "email" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobileNo_key" ON "users"("mobileNo");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
