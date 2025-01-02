-- AlterTable
ALTER TABLE "users" ADD COLUMN     "forgotPasswordSmsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;
