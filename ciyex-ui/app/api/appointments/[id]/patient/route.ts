import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Appointment } from "@prisma/client";

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    return NextResponse.json(appointment.patient);
  } catch (error) {
    console.error("[APPOINTMENT_PATIENT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 