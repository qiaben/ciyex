/*
  Warnings:

  - The values [CASH] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `testCode` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `testDescription` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `testName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `testPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `amount_paid` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `bill_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `patient_id` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `resultValue` on the `TestResult` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CARD', 'AMAZON_PAY', 'CASH_PAY');
ALTER TABLE "Payment" ALTER COLUMN "payment_method" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
ALTER TABLE "Payment" ALTER COLUMN "payment_method" SET DEFAULT 'CARD';
COMMIT;

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_staff_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_testId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "testCode",
DROP COLUMN "testDescription",
DROP COLUMN "testName",
DROP COLUMN "testPrice",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amount_paid",
DROP COLUMN "bill_id",
DROP COLUMN "discount",
DROP COLUMN "total_amount",
ALTER COLUMN "payment_method" SET DEFAULT 'CARD';

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "patient_id",
DROP COLUMN "staff_id",
ADD COLUMN     "appointmentId" INTEGER,
ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "patientId" TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "createdAt",
DROP COLUMN "testId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "labTestId" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "patientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TestResult" DROP COLUMN "resultValue",
ADD COLUMN     "result" TEXT DEFAULT '';

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
