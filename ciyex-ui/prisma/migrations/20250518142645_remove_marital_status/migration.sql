/*
  Warnings:

  - You are about to drop the column `marital_status` on the `Patient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[license_number]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `city` on table `Doctor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `npi_number` on table `Doctor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Doctor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zip` on table `Doctor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Doctor" ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "npi_number" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "zip" SET NOT NULL;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "marital_status";

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_license_number_key" ON "Doctor"("license_number");
