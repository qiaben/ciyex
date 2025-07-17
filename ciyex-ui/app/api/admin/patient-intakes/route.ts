import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "../../../utils/auth";

export async function GET() {
  try {
    const user = await getCurrentUserFromToken();
    if (!user?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const intakes = await prisma.patientIntake.findMany({
      include: {
        patient: true,
        doctor: true,
        service: true,
        appointment: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ intakes });
  } catch (error) {
    console.error("[PATIENT_INTAKES_GET]", error);
    return NextResponse.json({ intakes: [] });
  }
}
