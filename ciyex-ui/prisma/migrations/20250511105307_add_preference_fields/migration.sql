/*
  Warnings:

  - Added the required column `preferred_appointment_type` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferred_contact_method` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "preferred_appointment_type" TEXT NOT NULL,
ADD COLUMN     "preferred_contact_method" TEXT NOT NULL;
