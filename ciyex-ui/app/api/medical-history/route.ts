import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromToken } from "@/utils/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const user = await getCurrentUserFromToken();

    if (!patientId && !user?.userId) {
      return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
      );
    }

    const data = await db.medicalRecords.findMany({
      where: { patient_id: patientId ? patientId : String(user.userId) },
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
