import { prisma } from "@/lib/prisma";

export async function getBillsForAppointment(appointmentId: string) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        appointment_id: parseInt(appointmentId),
      },
      include: {
        bills: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return payment?.bills || [];
  } catch (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }
}

export async function getPaymentForAppointment(appointmentId: string) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        appointment_id: parseInt(appointmentId),
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
}

export async function getServicesData() {
  try {
    const services = await prisma.services.findMany({
      select: {
        id: true,
        service_name: true,
        price: true,
        description: true,
      },
      orderBy: {
        service_name: "asc",
      },
    });

    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
} 