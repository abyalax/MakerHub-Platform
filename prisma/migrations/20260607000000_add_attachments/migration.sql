-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "owner_type" VARCHAR(100) NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "object_key" VARCHAR(500) NOT NULL,
    "bucket" VARCHAR(100) NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "content_type" VARCHAR(255) NOT NULL,
    "size" INTEGER NOT NULL,
    "file_category" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attachments_object_key_unique" ON "attachments"("object_key");

-- CreateIndex
CREATE INDEX "attachments_owner_type_owner_id_idx" ON "attachments"("owner_type", "owner_id");
