 import { prisma } from "@/lib/prisma";

export async function createAppointmentNotification(
  userId: string,
  type: string,
  appointmentId: string,
  patientName: string,
  doctorName: string,
  serviceType: string,
  appointmentDate: Date
) {
  try {
    const message = generateNotificationMessage(type, patientName, doctorName, serviceType, appointmentDate);
    
    await prisma.notification.create({
      data: {
        userId,
        orderId: parseInt(appointmentId),
        message,
        read: false
      }
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

function generateNotificationMessage(
  type: string,
  patientName: string,
  doctorName: string,
  serviceType: string,
  appointmentDate: Date
): string {
  const date = new Date(appointmentDate).toLocaleDateString();
  
  switch (type) {
    case "APPOINTMENT_BOOKED":
      return `New appointment request from ${patientName} for ${serviceType} on ${date}`;
    case "APPOINTMENT_APPROVED":
      return `Your appointment with Dr. ${doctorName} for ${serviceType} has been scheduled for ${date}`;
    case "APPOINTMENT_CANCELLED":
      return `Your appointment with Dr. ${doctorName} for ${serviceType} on ${date} has been cancelled`;
    default:
      return "New notification";
  }
} 