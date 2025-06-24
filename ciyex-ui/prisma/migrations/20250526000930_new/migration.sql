-- AlterTable
ALTER TABLE "Services" ADD COLUMN     "insurance_accepted" TEXT[] DEFAULT ARRAY['All']::TEXT[];
