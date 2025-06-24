/*
  Warnings:

  - You are about to drop the column `labtest_id` on the `Services` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Services" DROP CONSTRAINT "Services_labtest_id_fkey";

-- AlterTable
ALTER TABLE "Services" DROP COLUMN "labtest_id",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'virtual',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
