-- CreateTable
CREATE TABLE "announcements" (
    "id" SERIAL NOT NULL,
    "announcements" JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "announcements_id_key" ON "announcements"("id");
