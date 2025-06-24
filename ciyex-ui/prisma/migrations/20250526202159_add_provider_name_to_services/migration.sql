/*
  Warnings:

  - Made the column `providerName` on table `Services` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Services" ALTER COLUMN "providerName" SET NOT NULL;
