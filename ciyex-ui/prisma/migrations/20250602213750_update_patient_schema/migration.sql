/*
  Warnings:

  - You are about to drop the column `banner_image` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `profile_image` on the `Patient` table. All the data in the column will be lost.
  - Made the column `height` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emergency_contact_name` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emergency_contact_number` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `relation` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zip_code` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preferred_appointment_type` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preferred_contact_method` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `marital_status` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "banner_image",
DROP COLUMN "profile_image",
ALTER COLUMN "height" SET NOT NULL,
ALTER COLUMN "weight" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "emergency_contact_name" SET NOT NULL,
ALTER COLUMN "emergency_contact_number" SET NOT NULL,
ALTER COLUMN "relation" SET NOT NULL,
ALTER COLUMN "privacy_consent" DROP DEFAULT,
ALTER COLUMN "service_consent" DROP DEFAULT,
ALTER COLUMN "medical_consent" DROP DEFAULT,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "zip_code" SET NOT NULL,
ALTER COLUMN "preferred_appointment_type" SET NOT NULL,
ALTER COLUMN "preferred_contact_method" SET NOT NULL,
ALTER COLUMN "marital_status" SET NOT NULL,
ALTER COLUMN "marital_status" DROP DEFAULT;
