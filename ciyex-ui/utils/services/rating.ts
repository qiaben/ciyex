import db from "@/lib/db";

interface RatingWithPatient {
  id: number;
  rating: number;
  comment: string | null;
  created_at: Date;
  patient: {
    first_name: string;
    last_name: string;
  };
}

export const getDoctorRatings = async (doctorId: string) => {
  try {
    const ratings = await db.rating.findMany({
      where: {
        staff_id: doctorId,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        patient: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return ratings.map((rating) => ({
      id: rating.id.toString(),
      rating: rating.rating,
      comment: rating.comment || "",
      patient_name: `${rating.patient.first_name} ${rating.patient.last_name}`,
      created_at: rating.created_at,
    }));
  } catch (error) {
    console.error("Error fetching doctor ratings:", error);
    return [];
  }
};

export const getRecentApplications = async (doctorId: string) => {
  try {
    const applications = await db.appointment.findMany({
      where: {
        doctor_id: doctorId,
        status: {
          in: ['PENDING', 'SCHEDULED']
        }
      },
      orderBy: {
        appointment_date: 'asc'
      },
      take: 5,
      include: {
        patient: {
          select: {
            first_name: true,
            last_name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    return applications.map(app => ({
      id: app.id.toString(),
      patient_name: `${app.patient.first_name} ${app.patient.last_name}`,
      appointment_date: app.appointment_date,
      status: app.status,
      contact: {
        phone: app.patient.phone,
        email: app.patient.email
      }
    }));
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    return [];
  }
}; 