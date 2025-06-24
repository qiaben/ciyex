/*
  Warnings:

  - You are about to drop the column `insurance_accepted` on the `Services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Services" DROP COLUMN "insurance_accepted";

-- CreateTable
CREATE TABLE "InsuranceAccepted" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceAccepted_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsuranceAccepted" ADD CONSTRAINT "InsuranceAccepted_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
