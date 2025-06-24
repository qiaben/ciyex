/*
  Warnings:

  - The values [UNPAID,PART] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `appointmentId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `labTestId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `TestResult` table. All the data in the column will be lost.
  - Added the required column `testName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount_paid` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_id` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staff_id` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `patientId` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PAID', 'FAILED');
ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PAID';
COMMIT;

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_labTestId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_patientId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "payment_method" "PaymentMethod" DEFAULT 'CARD';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "testCode" TEXT,
ADD COLUMN     "testDescription" TEXT,
ADD COLUMN     "testName" TEXT NOT NULL,
ADD COLUMN     "testPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "amount_paid" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bill_id" INTEGER,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_amount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PAID';

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "appointmentId",
DROP COLUMN "doctorId",
DROP COLUMN "patientId",
ADD COLUMN     "patient_id" TEXT NOT NULL,
ADD COLUMN     "staff_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "created_at",
DROP COLUMN "labTestId",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "testId" INTEGER NOT NULL,
ALTER COLUMN "patientId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TestResult" DROP COLUMN "result",
ADD COLUMN     "resultValue" TEXT;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_testId_fkey" FOREIGN KEY ("testId") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
