import db from '@/lib/db';
import { Appointment as PrismaAppointment, AppointmentStatus } from '@prisma/client';

interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  reason: string;
  date: Date;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
}

export async function getRecentApplications(doctorId: string): Promise<Appointment[]> {
  try {
    const appointments = await db.appointment.findMany({
      where: { 
        doctor_id: doctorId,
        status: {
          in: ['SCHEDULED', 'PENDING']
        }
      },
      include: {
        patient: {
          select: {
            first_name: true,
            last_name: true,
            img: true,
          },
        },
      },
      orderBy: {
        appointment_date: 'asc', // Order by date ascending to show nearest appointments first
      },
      take: 5, // Get only the 5 most recent appointments
    });

    return appointments.map((appointment: PrismaAppointment & { patient: { first_name: string; last_name: string; img: string | null } }) => ({
      id: appointment.id.toString(),
      patientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
      patientAvatar: appointment.patient.img || undefined,
      reason: appointment.reason || '',
      date: appointment.appointment_date,
      status: appointment.status === 'SCHEDULED' ? 'upcoming' : 'pending',
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
} 