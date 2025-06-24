import db from '@/lib/db';
import { Rating } from '@prisma/client';

export async function getDoctorById(id: string) {
  try {
    const doctor = await db.doctor.findUnique({
      where: { id },
      include: {
        working_days: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    if (!doctor) return { data: null, totalAppointment: 0 };

    // Calculate average rating
    const ratings = await db.rating.findMany({
      where: { staff_id: id },
    });

    const averageRating = ratings.length > 0
      ? ratings.reduce((acc: number, curr: Rating) => acc + curr.rating, 0) / ratings.length
      : 0;

    return {
      data: {
        ...doctor,
        rating: averageRating.toFixed(1),
        totalAppointments: doctor._count.appointments,
      },
      totalAppointment: doctor._count.appointments,
    };
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return { data: null, totalAppointment: 0 };
  }
} 