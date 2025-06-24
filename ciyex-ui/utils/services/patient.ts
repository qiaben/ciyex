import db from "@/lib/db";
import { getMonth, format, startOfYear, endOfYear, isToday } from "date-fns";
import { daysOfWeek } from "..";

type AppointmentStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface Appointment {
  status: AppointmentStatus;
  appointment_date: Date;
}

function isValidStatus(status: string): status is AppointmentStatus {
  return ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"].includes(status);
}

const initializeMonthlyData = () => {
  const this_year = new Date().getFullYear();
  return Array.from({ length: 12 }, (_, index) => ({
    name: format(new Date(this_year, index), "MMM"),
    appointment: 0,
    completed: 0,
    date: format(new Date(this_year, index), "yyyy-MM-dd")
  }));
};

export const processAppointments = async (appointments: Appointment[]) => {
  const monthlyData = initializeMonthlyData();
  const this_year = new Date().getFullYear();
  const startDate = startOfYear(new Date());
  const endDate = endOfYear(new Date());

  const appointmentCounts = appointments.reduce<
    Record<AppointmentStatus, number>
  >(
    (acc, appointment) => {
      const status = appointment.status;
      const appointmentDate = appointment?.appointment_date;
      const monthIndex = getMonth(appointmentDate);

      if (
        appointmentDate >= startDate &&
        appointmentDate <= endDate
      ) {
        monthlyData[monthIndex].appointment += 1;

        if (status === "COMPLETED") {
          monthlyData[monthIndex].completed += 1;
        }
      }

      // Grouping by status
      if (isValidStatus(status)) {
        acc[status] = (acc[status] || 0) + 1;
      }

      return acc;
    },
    {
      PENDING: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }
  );

  return { appointmentCounts, monthlyData };
};

export async function getPatientDashboardStatistics(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        message: "No data found",
        data: null,
      };
    }

    const data = await db.patient.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        gender: true,
        img: true,
        colorCode: true,
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Patient data not found",
        status: 200,
        data: null,
      };
    }

    const appointments = await db.appointment.findMany({
      where: { patient_id: data?.id },
      select: {
        id: true,
        appointment_date: true,
        status: true,
        doctor: {
          select: {
            id: true,
            name: true,
            img: true,
            specialization: true,
            colorCode: true,
          },
        },
        patient: {
          select: {
            first_name: true,
            last_name: true,
            gender: true,
            date_of_birth: true,
            img: true,
            colorCode: true,
          },
        },
        bills: {
          select: {
            payment_method: true,
            payment_date: true,
            status: true,
          },
        },
      },
      orderBy: { appointment_date: "desc" },
    });

    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      doctor: appointment.doctor,
      patient: appointment.patient,
      appointment_date: appointment.appointment_date,
      status: appointment.status,
      payment_method: appointment.bills?.payment_method || 'CARD',
      payment_date: appointment.bills?.payment_date || null,
      payment_status: appointment.bills?.status || null,
    }));

    const { appointmentCounts, monthlyData } = await processAppointments(
      formattedAppointments
    );
    const last5Records = formattedAppointments.slice(0, 5);

    const today = daysOfWeek[new Date().getDay()] || daysOfWeek[0];

    const availableDoctor = await db.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        img: true,
        working_days: true,
        colorCode: true,
      },
      where: {
        working_days: {
          some: {
            day: {
              equals: today,
              mode: "insensitive",
            },
          },
        },
      },
      take: 4,
    });

    return {
      success: true,
      data,
      appointmentCounts,
      last5Records,
      totalAppointments: formattedAppointments.length,
      availableDoctor,
      monthlyData,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getPatientById(id: string) {
  try {
    const patient = await db.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient data not found",
        status: 200,
        data: null,
      };
    }

    return { success: true, data: patient, status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getPatientFullDataById(id: string) {
  try {
    console.log('Searching for patient with ID:', id);
    
    const patient = await db.patient.findFirst({
      where: {
        OR: [
          { id },
          { email: id }
        ],
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        date_of_birth: true,
        gender: true,
        phone: true,
        email: true,
        height: true,
        weight: true,
        address: true,
        city: true,
        state: true,
        zip_code: true,
        emergency_contact_name: true,
        emergency_contact_number: true,
        relation: true,
        blood_group: true,
        allergies: true,
        medical_conditions: true,
        medical_history: true,
        insurance_provider: true,
        insurance_number: true,
        privacy_consent: true,
        service_consent: true,
        medical_consent: true,
        img: true,
        colorCode: true,
        preferred_contact_method: true,
        preferred_appointment_type: true,
        _count: {
          select: {
            appointments: true,
          },
        },
        appointments: {
          select: {
            appointment_date: true,
          },
          orderBy: {
            appointment_date: "desc",
          },
          take: 1,
        },
      },
    });

    console.log('Database query result:', JSON.stringify(patient, null, 2));

    if (!patient) {
      console.log('No patient found in database');
      return {
        success: false,
        message: "Patient data not found",
        status: 404,
      };
    }

    const lastVisit = patient.appointments[0]?.appointment_date || null;

    const response = {
      success: true,
      data: {
        ...patient,
        totalAppointments: patient._count.appointments,
        lastVisit,
      },
      status: 200,
    };

    console.log('Returning response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error in getPatientFullDataById:', error);
    return { 
      success: false, 
      message: "Internal Server Error", 
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getAllPatients({
  page,
  limit,
  search,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const [patients, totalRecords] = await Promise.all([
      db.patient.findMany({
        where: {
          OR: [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        include: {
          appointments: {
            select: {
              medical: {
                select: { created_at: true, treatment_plan: true },
                orderBy: { created_at: "desc" },
                take: 1,
              },
            },
            orderBy: { appointment_date: "desc" },
            take: 1,
          },
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { first_name: "asc" },
      }),
      db.patient.count(),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data: patients,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}