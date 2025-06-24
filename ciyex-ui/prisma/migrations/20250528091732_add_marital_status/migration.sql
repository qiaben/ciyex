/*
  Warnings:

  - You are about to drop the column `quantity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `test_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientCity` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientDob` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientFirstName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientGender` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientLastName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientPhone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientState` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientZipCode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentStatus` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `marital_status` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('SCHEDULED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('SCHEDULED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_test_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_user_id_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "quantity",
DROP COLUMN "test_id",
DROP COLUMN "user_id",
ADD COLUMN     "orderNumber" TEXT NOT NULL,
ADD COLUMN     "patientAddress" TEXT NOT NULL,
ADD COLUMN     "patientCity" TEXT NOT NULL,
ADD COLUMN     "patientDob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "patientEmail" TEXT NOT NULL,
ADD COLUMN     "patientFirstName" TEXT NOT NULL,
ADD COLUMN     "patientGender" TEXT NOT NULL,
ADD COLUMN     "patientId" TEXT NOT NULL,
ADD COLUMN     "patientLastName" TEXT NOT NULL,
ADD COLUMN     "patientPhone" TEXT NOT NULL,
ADD COLUMN     "patientState" TEXT NOT NULL,
ADD COLUMN     "patientZipCode" TEXT NOT NULL,
ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL,
ADD COLUMN     "transactionId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "marital_status" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "testName" TEXT NOT NULL,
    "testCode" TEXT,
    "testDescription" TEXT,
    "testPrice" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "resultValue" TEXT,
    "normalRange" TEXT,
    "unit" TEXT,
    "status" "TestStatus" NOT NULL DEFAULT 'SCHEDULED',
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "fileAttachment" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "patientId" TEXT NOT NULL,
    "testId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_testId_fkey" FOREIGN KEY ("testId") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_testId_fkey" FOREIGN KEY ("testId") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_testId_fkey" FOREIGN KEY ("testId") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
