import db from '@/lib/db';
import { Rating as PrismaRating } from '@prisma/client';

interface Rating {
  id: string;
  rating: number;
  comment: string;
  patientName: string;
  patientAvatar?: string;
  date: Date;
}

export async function getDoctorRatings(doctorId: string): Promise<Rating[]> {
  try {
    const ratings = await db.rating.findMany({
      where: { staff_id: doctorId },
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
        created_at: 'desc',
      },
    });

    return ratings.map((rating: PrismaRating & { patient: { first_name: string; last_name: string; img: string | null } }) => ({
      id: rating.id.toString(),
      rating: rating.rating,
      comment: rating.comment || '',
      patientName: `${rating.patient.first_name} ${rating.patient.last_name}`,
      patientAvatar: rating.patient.img || undefined,
      date: rating.created_at,
    }));
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
} 