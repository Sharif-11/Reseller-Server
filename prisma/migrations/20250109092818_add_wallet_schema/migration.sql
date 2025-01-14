-- CreateTable
CREATE TABLE "wallets" (
    "walletId" SERIAL NOT NULL,
    "walletName" TEXT NOT NULL,
    "walletPhoneNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("walletId")
);

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
