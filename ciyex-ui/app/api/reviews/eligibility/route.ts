import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET /api/reviews/eligibility?testId=123
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ eligible: false });
  }
  const { searchParams } = new URL(req.url);
  const testId = searchParams.get('testId');
  if (!testId) {
    return NextResponse.json({ eligible: false });
  }
  // Find patient
  const patient = await prisma.patient.findFirst({ where: { id: userId } });
  if (!patient) {
    return NextResponse.json({ eligible: false });
  }
  // Only allow review if patient has completed this test
  const completedTest = await prisma.testResult.findFirst({
    where: {
      testId: Number(testId),
      status: 'COMPLETED',
      order: { patientId: patient.id },
    },
  });
  if (!completedTest) {
    return NextResponse.json({ eligible: false });
  }
  // Only one review per patient per test
  const existing = await prisma.review.findFirst({
    where: { patientId: patient.id, testId: Number(testId) },
  });
  if (existing) {
    return NextResponse.json({ eligible: false });
  }
  return NextResponse.json({ eligible: true });
} 