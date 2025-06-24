-- CreateTable
CREATE TABLE "DoctorRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "npiNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "yearsInPractice" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "workingDays" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DoctorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorRequest_status_idx" ON "DoctorRequest"("status");

-- CreateIndex
CREATE INDEX "DoctorRequest_userId_idx" ON "DoctorRequest"("userId");
