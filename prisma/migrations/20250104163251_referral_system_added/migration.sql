-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referredByPhone" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredByPhone_fkey" FOREIGN KEY ("referredByPhone") REFERENCES "users"("phoneNo") ON DELETE SET NULL ON UPDATE CASCADE;
