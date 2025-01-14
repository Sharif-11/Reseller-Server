/*
  Warnings:

  - The values [PENDING,COMPLETED,REJECTED] on the enum `WithdrawStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WithdrawStatus_new" AS ENUM ('pending', 'completed', 'rejected');
ALTER TABLE "withdraw_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "withdraw_requests" ALTER COLUMN "status" TYPE "WithdrawStatus_new" USING ("status"::text::"WithdrawStatus_new");
ALTER TYPE "WithdrawStatus" RENAME TO "WithdrawStatus_old";
ALTER TYPE "WithdrawStatus_new" RENAME TO "WithdrawStatus";
DROP TYPE "WithdrawStatus_old";
ALTER TABLE "withdraw_requests" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "withdraw_requests" ALTER COLUMN "status" SET DEFAULT 'pending';
