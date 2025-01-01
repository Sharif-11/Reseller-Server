-- CreateTable
CREATE TABLE "product_meta" (
    "metaId" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_meta_pkey" PRIMARY KEY ("metaId")
);

-- CreateIndex
CREATE INDEX "productMetaIndex" ON "product_meta"("productId", "key");

-- AddForeignKey
ALTER TABLE "product_meta" ADD CONSTRAINT "product_meta_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
