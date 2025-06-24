/*
  Warnings:

  - You are about to drop the column `notes` on the `LabTest` table. All the data in the column will be lost.
  - You are about to drop the column `record_id` on the `LabTest` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `LabTest` table. All the data in the column will be lost.
  - You are about to drop the column `service_id` on the `LabTest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `LabTest` table. All the data in the column will be lost.
  - You are about to drop the column `test_date` on the `LabTest` table. All the data in the column will be lost.
  - You are about to drop the `DoctorRequest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `LabTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `LabTest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LabTest" DROP CONSTRAINT "LabTest_record_id_fkey";

-- DropForeignKey
ALTER TABLE "LabTest" DROP CONSTRAINT "LabTest_service_id_fkey";

-- DropIndex
DROP INDEX "LabTest_service_id_key";

-- AlterTable
ALTER TABLE "LabTest" DROP COLUMN "notes",
DROP COLUMN "record_id",
DROP COLUMN "result",
DROP COLUMN "service_id",
DROP COLUMN "status",
DROP COLUMN "test_date",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Services" ADD COLUMN     "labtest_id" INTEGER;

-- DropTable
DROP TABLE "DoctorRequest";

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "test_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LabTestToMedicalRecords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_LabTestToMedicalRecords_AB_unique" ON "_LabTestToMedicalRecords"("A", "B");

-- CreateIndex
CREATE INDEX "_LabTestToMedicalRecords_B_index" ON "_LabTestToMedicalRecords"("B");

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_labtest_id_fkey" FOREIGN KEY ("labtest_id") REFERENCES "LabTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestToMedicalRecords" ADD CONSTRAINT "_LabTestToMedicalRecords_A_fkey" FOREIGN KEY ("A") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestToMedicalRecords" ADD CONSTRAINT "_LabTestToMedicalRecords_B_fkey" FOREIGN KEY ("B") REFERENCES "MedicalRecords"("id") ON DELETE CASCADE ON UPDATE CASCADE;
