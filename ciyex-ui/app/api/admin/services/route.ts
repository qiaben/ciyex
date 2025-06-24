import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PatientIntake, Services, PaymentStatus, Doctor, Rating, Patient, Appointment } from "@prisma/client";

interface Bill {
  status: PaymentStatus;
  amount_paid: number;
}

interface AppointmentWithBills {
  status: string;
  bills: Bill[];
}

interface PatientIntakeWithRelations extends PatientIntake {
  patient: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'email' | 'phone'>;
  appointment: Pick<Appointment, 'id' | 'appointment_date' | 'time' | 'status' | 'type' | 'mode'> & {
    bills: { status: PaymentStatus }[];
  };
}

interface ServiceWithRelations extends Services {
  doctor: Pick<Doctor, 'id' | 'name' | 'specialization'> & {
    _count: { appointments: number };
    patientIntakes: PatientIntakeWithRelations[];
    Rating: Pick<Rating, 'rating'>[];
  };
  patientIntakes: PatientIntakeWithRelations[];
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch services with their related data
    const services = await prisma.services.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            _count: {
              select: {
                appointments: true,
              },
            },
            Rating: { select: { rating: true } },
            patientIntakes: {
              where: {
                created_at: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
                },
              },
              include: {
                appointment: {
                  select: {
                    status: true,
                    bills: {
                      select: {
                        status: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patientIntakes: {
          include: {
            patient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
              },
            },
            appointment: {
              select: {
                id: true,
                appointment_date: true,
                time: true,
                status: true,
                type: true,
                mode: true,
                bills: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // If no services found, return empty arrays
    if (!services || services.length === 0) {
      return NextResponse.json({
        interactions: [],
        doctorStats: []
      });
    }

    // Transform services into interactions
    const interactions = services.flatMap(service => 
      (service as any).patientIntakes.map((intake: any) => ({
        id: intake.id,
        patientName: `${intake.patient.first_name} ${intake.patient.last_name}`,
        patientEmail: intake.patient.email,
        patientId: intake.patient.id,
        doctorName: (service as any).doctor.name,
        doctorId: (service as any).doctor.id,
        specialty: (service as any).doctor.specialization,
        serviceName: service.service_name,
        serviceType: service.mode,
        appointmentDate: intake.appointment?.appointment_date.toISOString().split('T')[0] || '',
        appointmentTime: intake.appointment?.time || '',
        duration: '30 min', // Default duration
        status: intake.appointment?.status.toLowerCase() || 'scheduled',
        insurance: 'Not specified', // Default value
        amount: `$${service.price}`,
      }))
    );

    // Group services by doctor and calculate stats
    const doctorMap = new Map();
    
    services.forEach(service => {
      const doctor = (service as any).doctor;
      if (!doctorMap.has(doctor.id)) {
        // Get all services for this doctor
        const doctorServices = services
          .filter(s => (s as any).doctor.id === doctor.id)
          .map(s => ({
            id: s.id,
            name: s.service_name,
            price: s.price,
            mode: s.mode,
            description: s.description || '',
            totalAppointments: (s as any).patientIntakes.length,
            revenue: s.price * (s as any).patientIntakes.length,
          }));

        // Calculate total revenue from all services for this doctor
        const totalRevenue = doctorServices.reduce((sum, s) => sum + s.revenue, 0);

        doctorMap.set(doctor.id, {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialization,
          totalPatients: doctor._count.appointments,
          thisWeek: doctor.patientIntakes.length,
          revenue: `$${totalRevenue.toFixed(2)}`,
          rating: doctor.Rating && doctor.Rating.length > 0 
            ? (doctor.Rating.reduce((sum: number, r: any) => sum + r.rating, 0) / doctor.Rating.length).toFixed(1)
            : 'N/A',
          services: doctorServices,
        });
      }
    });

    const doctorStats = Array.from(doctorMap.values());

    return NextResponse.json({
      interactions,
      doctorStats,
    });
  } catch (error) {
    console.error("[SERVICES_GET]", error);
    // Return empty arrays instead of error when something goes wrong
    return NextResponse.json({
      interactions: [],
      doctorStats: []
    });
  }
} 