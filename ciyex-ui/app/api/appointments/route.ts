import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAppointmentNotification } from "@/lib/notifications";
import { AppointmentStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as AppointmentStatus | null;
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    const role = searchParams.get("role");

    let where = {};
    if (doctorId) {
      where = { doctor_id: doctorId };
    } else if (patientId) {
      where = { patient_id: patientId };
    } else if (role === "doctor") {
      where = { doctor_id: userId };
    } else if (role === "patient") {
      where = { patient_id: userId };
    }
    if (status) {
      where = { ...where, status };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            img: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true
          }
        }
      },
      orderBy: {
        appointment_date: "desc",
      },
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received appointment data:', body);
    
    const { doctor_id, appointment_date, time, type, note, mode, payment_intent_id } = body;

    if (!userId || !doctor_id || !payment_intent_id || !appointment_date || !time) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields",
        missing: {
          userId: !userId,
          doctor_id: !doctor_id,
          payment_intent_id: !payment_intent_id,
          appointment_date: !appointment_date,
          time: !time
        }
      }, { status: 400 });
    }

    // Verify payment intent with Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ success: false, message: "Payment not verified" }, { status: 400 });
    }

    // Get the payment amount from Stripe (convert from cents to dollars)
    const amount = paymentIntent.amount / 100;

    // Create appointment with proper date handling
    const appointment = await prisma.appointment.create({
      data: {
        patient_id: userId,
        doctor_id,
        type,
        mode,
        reason: note || '',
        appointment_date: new Date(appointment_date),
        time,
        status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Create payment record with amount from Stripe
    await prisma.payment.create({
      data: {
        appointment_id: appointment.id,
        patient_id: userId,
        bill_date: new Date(),
        payment_date: new Date(),
        payment_method: PaymentMethod.CARD,
        status: PaymentStatus.PAID,
      },
    });

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      error: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 