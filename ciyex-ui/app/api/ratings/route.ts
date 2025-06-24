import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await db.rating.findMany({
      take: 10,
      where: { 
        patient_id: patientId || userId 
      },
      include: { 
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { 
        created_at: "desc" 
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 