import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const { userId } = await auth();

    if (!patientId && !userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await db.medicalRecords.findMany({
      where: { patient_id: patientId ? patientId : userId! },
      include: {
        diagnosis: { include: { doctor: true } },
        lab_test: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching medical history:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch medical history" },
      { status: 500 }
    );
  }
} 