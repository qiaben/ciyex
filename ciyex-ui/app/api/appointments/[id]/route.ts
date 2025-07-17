import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAppointmentNotification } from "@/lib/notifications";
import { getCurrentUserFromToken } from "../../../utils/auth";

// Next.js expects dynamic route param to be passed in `params` (not Promise)
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUserFromToken();
    if (!user?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 });
    }

    // Ensure IDs are compared as strings
    if (
        String(appointment.doctor_id) !== String(user.userId) &&
        String(appointment.patient_id) !== String(user.userId)
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('[APPOINTMENT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUserFromToken();
    if (!user?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Create notification for the appropriate user based on status change
    if (status === "APPROVED") {
      await createAppointmentNotification(
          appointment.patient_id,
          "APPOINTMENT_APPROVED",
          appointment.id.toString(),
          `${appointment.patient.first_name} ${appointment.patient.last_name}`,
          appointment.doctor.name,
          appointment.type,
          appointment.appointment_date
      );
    } else if (status === "CANCELLED") {
      await createAppointmentNotification(
          appointment.patient_id,
          "APPOINTMENT_CANCELLED",
          appointment.id.toString(),
          `${appointment.patient.first_name} ${appointment.patient.last_name}`,
          appointment.doctor.name,
          appointment.type,
          appointment.appointment_date
      );
    } else if (status === "PENDING") {
      await createAppointmentNotification(
          appointment.doctor_id,
          "APPOINTMENT_BOOKED",
          appointment.id.toString(),
          `${appointment.patient.first_name} ${appointment.patient.last_name}`,
          appointment.doctor.name,
          appointment.type,
          appointment.appointment_date
      );
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
