-- CreateTable
CREATE TABLE "commissions" (
    "id" SERIAL NOT NULL,
    "startPrice" DECIMAL(15,2) NOT NULL,
    "endPrice" DECIMAL(15,2) NOT NULL,
    "commission" DECIMAL(15,2) NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commissions_startPrice_endPrice_key" ON "commissions"("startPrice", "endPrice");
