import db from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { daysOfWeek } from "..";
import { processAppointments } from "./patient";
import { withDatabaseConnection } from "@/utils/database";

export async function getDoctors() {
  const result = await withDatabaseConnection(async () => {
    return await db.doctor.findMany({
      take: 100,
      skip: 0,
      select: {
        id: true,
        email: true,
        name: true,
        specialization: true,
        license_number: true,
        phone: true,
        address: true,
        img: true,
        colorCode: true,
        availability_status: true,
        type: true,
        created_at: true,
        updated_at: true,
        city: true,
        npi_number: true,
        state: true,
        years_in_practice: true,
        zip: true,
        state_licensure: true,
        appointments: {
          select: {
            id: true
          }
        },
        diagnosis: {
          select: {
            id: true
          }
        },
        patientIntakes: {
          select: {
            id: true
          }
        },
        Rating: {
          select: {
            id: true
          }
        },
        services: {
          select: {
            id: true
          }
        },
        working_days: {
          select: {
            id: true
          }
        }
      }
    });
  });

  if (!result.success) {
    return { 
      success: false, 
      message: result.error || "Internal Server Error", 
      status: 500 
    };
  }

  return { success: true, data: result.data, status: 200 };
}

export async function getDoctorDashboardStats(userId: string) {
  try {
    const todayDate = new Date().getDay();
    const today = daysOfWeek[todayDate];

    const [totalPatient, appointments, doctors, services] = await Promise.all([
      db.patient.count(),
      db.appointment.findMany({
        where: { doctor_id: userId },
        include: {
          patient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              gender: true,
              date_of_birth: true,
              colorCode: true,
              img: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              img: true,
              colorCode: true,
            },
          },
          bills: {
            select: {
              payment_date: true,
            },
          },
          patientIntake: { select: { service_id: true } },
        },
        orderBy: { appointment_date: "desc" },
      }),
      db.doctor.findMany({
        where: {
          working_days: {
            some: { day: { equals: today, mode: "insensitive" } },
          },
        },
        select: {
          id: true,
          name: true,
          specialization: true,
          img: true,
          colorCode: true,
          working_days: true,
        },
        take: 5,
      }),
      db.services.findMany({
        where: { doctor_id: userId },
        include: {
          patientIntakes: {
            select: {
              id: true,
              appointment: {
                select: {
                  status: true,
                  bills: {
                    select: {
                      payment_date: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Get all appointments for this doctor
    const allAppointments = await db.appointment.findMany({
      where: { doctor_id: userId },
      select: { status: true }
    });

    // Count appointments by status
    const appointmentCounts = {
      PENDING: allAppointments.filter((a: any) => a.status === 'PENDING').length,
      SCHEDULED: allAppointments.filter((a: any) => a.status === 'SCHEDULED').length,
      COMPLETED: allAppointments.filter((a: any) => a.status === 'COMPLETED').length,
      CANCELLED: allAppointments.filter((a: any) => a.status === 'CANCELLED').length,
    };

    // Calculate total active appointments (SCHEDULED + COMPLETED)
    const totalActiveAppointments = appointmentCounts.SCHEDULED + appointmentCounts.COMPLETED;

    const { monthlyData } = await processAppointments(appointments);

    const last5Records = appointments.slice(0, 5);

    // --- NEW: Aggregate monthly revenue and bookings from completed appointments, grouped by service ---
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Map: { [serviceId]: { [month]: { revenue, bookings } } }
    const serviceMonthlyMap: Record<number, Record<string, { revenue: number; bookings: number }>> = {};
    (appointments || []).forEach((appt: any) => {
      if (appt.status === "COMPLETED") {
        console.log('DEBUG COMPLETED:', {
          id: appt.id,
          bills: appt.bills,
          patientIntake: appt.patientIntake,
        });
      }
      if (appt.status === "COMPLETED" && appt.bills?.payment_date) {
        if (!appt.patientIntake) {
          console.log('DEBUG: Missing patientIntake for appointment:', appt.id);
          return;
        }
        const serviceId = Number(appt.patientIntake.service_id);
        const date = new Date(appt.appointment_date);
        const month = monthNames[date.getMonth()];
        if (!serviceMonthlyMap[serviceId]) serviceMonthlyMap[serviceId] = {};
        if (!serviceMonthlyMap[serviceId][month]) serviceMonthlyMap[serviceId][month] = { revenue: 0, bookings: 0 };
        serviceMonthlyMap[serviceId][month].revenue += appt.bills.payment_date;
        serviceMonthlyMap[serviceId][month].bookings += 1;
      }
    });
    // For the pie chart, you may want to sum all months for each service
    const serviceCompletedPayMap: Record<number, number> = {};
    Object.entries(serviceMonthlyMap).forEach(([serviceId, months]) => {
      serviceCompletedPayMap[Number(serviceId)] = Object.values(months).reduce((sum, m) => sum + m.revenue, 0);
    });
    // For the monthly chart, you may want to sum all services for each month
    const monthlyMap: { [key: string]: { revenue: number; bookings: number } } = {};
    Object.values(serviceMonthlyMap).forEach(months => {
      Object.entries(months).forEach(([month, data]) => {
        if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, bookings: 0 };
        monthlyMap[month].revenue += data.revenue;
        monthlyMap[month].bookings += data.bookings;
      });
    });
    const monthlyRevenueData = monthNames.map(month => ({
      month,
      revenue: monthlyMap[month]?.revenue || 0,
      bookings: monthlyMap[month]?.bookings || 0,
    }));
    // --- END NEW ---

    // Calculate service-specific revenue
    const serviceRevenue = services.map(service => {
      const completedPay = serviceCompletedPayMap[service.id] || 0;
      return {
        id: service.id,
        name: service.service_name,
        price: service.price,
        mode: service.mode,
        description: service.description || '',
        totalAppointments: service.patientIntakes.length,
        revenue: service.price * service.patientIntakes.length,
        completedPay,
      };
    });

    // Calculate total revenue from all services
    const totalRevenue = serviceRevenue.reduce((sum, s) => sum + s.revenue, 0);

    return {
      totalPatient,
      appointmentCounts,
      last5Records,
      availableDoctors: doctors,
      totalAppointment: totalActiveAppointments,
      monthlyData,
      appointments,
      serviceRevenue,
      totalRevenue,
      monthlyRevenueData,
      success: true,
      status: 200 
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getDoctorById(id: string) {
  try {
    const [doctor, totalAppointment] = await Promise.all([
      db.doctor.findUnique({
        where: { id },
        include: {
          working_days: true,
          appointments: {
            include: {
              patient: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  gender: true,
                  img: true,
                  colorCode: true,
                },
              },
              doctor: {
                select: {
                  name: true,
                  specialization: true,
                  img: true,
                  colorCode: true,
                },
              },
            },
            orderBy: { appointment_date: "desc" },
            take: 10,
          },
        },
      }),
      db.appointment.count({
        where: { doctor_id: id },
      }),
    ]);

    if (!doctor) {
      return { success: false, message: "Doctor not found", status: 404 };
    }

    return { 
      success: true, 
      data: doctor, 
      totalAppointment,
      status: 200 
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getRatingById(id: string) {
  try {
    const data = await db.rating.findMany({
      where: { staff_id: id },
      include: {
        patient: { select: { last_name: true, first_name: true } },
      },
    });

    const totalRatings = data?.length;
    const sumRatings = data?.reduce((sum: any, el: any) => sum + el.rating, 0);

    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    const formattedRatings = (Math.round(averageRating * 10) / 10).toFixed(1);

    return {
      totalRatings,
      averageRating: formattedRatings,
      ratings: data,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

// Helper to fetch all Clerk users (handles pagination)
async function getAllClerkUsers(client: any) {
  let users: any[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const res = await client.users.getUserList({ limit, offset });
    users = users.concat(res.data);
    if (res.data.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }
  return users;
}

export async function getAllDoctors({
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

    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { specialization: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    // Get all doctors from Clerk for live status counts (handle pagination)
    const client = await clerkClient();
    const allClerkUsers = await getAllClerkUsers(client);
    const doctorUsers = allClerkUsers.filter(user => user.publicMetadata?.role === 'doctor');
    const totalPending = doctorUsers.filter(user => user.publicMetadata?.status === 'pending').length;
    const totalApproved = doctorUsers.filter(user => user.publicMetadata?.status === 'approved').length;
    const totalRejected = doctorUsers.filter(user => user.publicMetadata?.status === 'rejected').length;

    // Get paginated doctors from database
    const [doctors, totalRecords] = await Promise.all([
      db.doctor.findMany({
        where: whereClause,
        include: { 
          working_days: true,
          appointments: {
            select: {
              id: true,
              status: true
            }
          }
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: {
          created_at: 'desc'
        }
      }),
      db.doctor.count({
        where: whereClause
      })
    ]);

    // Get Clerk users for the paginated doctors
    const clerkUsers = await client.users.getUserList({ 
      userId: doctors.map((d: any) => d.id) 
    });

    const formattedDoctors = doctors.map((doctor: any) => {
      const clerkUser = clerkUsers.data.find((u: any) => u.id === doctor.id);
      return {
        id: doctor.id,
        fullName: doctor.name,
        specialization: doctor.specialization,
        licenseNumber: doctor.license_number,
        email: doctor.email,
        submittedAt: doctor.created_at ? new Date(doctor.created_at).toISOString() : new Date().toISOString(),
        status: clerkUser?.publicMetadata?.status || 'pending',
        workingDays: doctor.working_days || [],
        totalAppointments: (doctor.appointments as any[])?.length || 0
      };
    });

    return {
      success: true,
      data: formattedDoctors,
      totalRecords,
      totalPending,
      totalApproved,
      totalRejected,
      totalPages: Math.ceil(totalRecords / LIMIT),
      currentPage: PAGE_NUMBER,
      status: 200
    };
  } catch (error) {
    console.error('Error in getAllDoctors:', error);
    return { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    };
  }
}

export async function createNewDoctor(data: any, did: string) {
  try {
    const doctorData = data;
    let doctor_id = did;

    // Validate working days data
    if (doctorData.working_days && !Array.isArray(doctorData.working_days)) {
      return { success: false, error: true, msg: "Working days must be an array" };
    }

    // Validate state licensure data
    if (doctorData.state_licensure && !Array.isArray(doctorData.state_licensure)) {
      return { success: false, error: true, msg: "State licensure must be an array" };
    }

    const password = doctorData.phone + 'A!';
    console.log("Creating Clerk user with:", {
      email: doctorData.email,
      password,
      firstName: doctorData.name,
      lastName: doctorData.name,
    });
    const client = await clerkClient();
    let user;
    // Split name for Clerk
    let firstName = doctorData.name;
    let lastName = '';
    if (doctorData.name && doctorData.name.includes(' ')) {
      const [first, ...rest] = doctorData.name.trim().split(' ');
      firstName = first;
      lastName = rest.join(' ');
    }
    // If userId is not provided, try to find user by email
    if (!doctorData.userId) {
      const foundUsers = await client.users.getUserList({ emailAddress: [doctorData.email] });
      if (foundUsers.data.length > 0) {
        doctorData.userId = foundUsers.data[0].id;
      }
    }
    if (doctorData.userId) {
      // Update existing Clerk user
      console.log("Updating existing Clerk user:", doctorData.userId);
      user = await client.users.updateUser(doctorData.userId, {
        firstName,
        lastName,
        publicMetadata: { role: "doctor", status: "pending" },
      });
      doctor_id = user.id;
    } else {
      // Create new Clerk user
      console.log("Creating new Clerk user with email:", doctorData.email);
      user = await client.users.createUser({
        emailAddress: [doctorData.email],
        password,
        firstName,
        lastName,
        publicMetadata: { role: "doctor", status: "pending" },
      });
      doctor_id = user.id;
    }

    // Prepare doctor data for DB with state_licensure
    const doctorDbData = {
      id: doctor_id,
      email: doctorData.email,
      name: doctorData.name,
      specialization: doctorData.specialization,
      license_number: doctorData.license_number,
      phone: doctorData.phone,
      address: doctorData.address,
      type: doctorData.type,
      city: doctorData.city,
      state: doctorData.state,
      zip: doctorData.zip,
      npi_number: doctorData.npi_number,
      years_in_practice: doctorData.years_in_practice,
      state_licensure: doctorData.state_licensure || [], // Add state_licensure field
    };

    // Create doctor with working days in a transaction
    await db.$transaction(async (prisma) => {
      // Create the doctor record
      await prisma.doctor.create({
      data: doctorDbData,
      });

      // Create working days if provided
      if (doctorData.working_days && doctorData.working_days.length > 0) {
        const workingDaysData = doctorData.working_days.map((day: any) => ({
          doctor_id: doctor_id,
          day: day.day,
          start_time: day.start_time,
          close_time: day.close_time || day.end_time,
        }));

        await prisma.workingDays.createMany({
          data: workingDaysData,
        });
      }
    });

    return { success: true, error: false, msg: "Doctor created successfully" };
  } catch (error: any) {
    console.error("Full error object:", error);
    if (error && error.errors) {
        console.error("Clerk errors:", JSON.stringify(error.errors, null, 2));
    }
    return { 
      success: false, 
      error: true, 
      msg: error?.message || (error.errors && JSON.stringify(error.errors)) 
    };
  }
}

export async function updateDoctor(data: any, id: string) {
  try {
    console.log("updateDoctor called with id:", id);
    
    // Validate working days data
    if (data.working_days && !Array.isArray(data.working_days)) {
      return { success: false, error: true, msg: "Working days must be an array" };
    }

    // Validate state licensure data
    if (data.state_licensure && !Array.isArray(data.state_licensure)) {
      return { success: false, error: true, msg: "State licensure must be an array" };
    }
    
    // First, check if the doctor exists
    const existingDoctor = await db.doctor.findUnique({
      where: { id },
      include: {
        working_days: true
      }
    });

    // If doctor doesn't exist, create one
    if (!existingDoctor) {
      console.log("Doctor not found, creating new doctor record for user:", id);
      
      // Prepare doctor data for DB with state_licensure
      const doctorDbData = {
        id: id,
        email: data.email,
        name: data.name,
        specialization: data.specialization,
        license_number: data.license_number,
        phone: data.phone,
        address: data.address,
        type: data.type,
        city: data.city,
        state: data.state,
        zip: data.zip,
        npi_number: data.npi_number,
        years_in_practice: data.years_in_practice,
        state_licensure: data.state_licensure || [], // Add state_licensure field
      };

      // Create doctor with working days in a transaction
      await db.$transaction(async (prisma) => {
      // Create the doctor record
        await prisma.doctor.create({
        data: doctorDbData,
      });

        // Create working days if provided
        if (data.working_days && data.working_days.length > 0) {
          const workingDaysData = data.working_days.map((day: any) => ({
            doctor_id: id,
            day: day.day,
            start_time: day.start_time,
            close_time: day.close_time || day.end_time,
          }));

          await prisma.workingDays.createMany({
            data: workingDaysData,
        });
      }
      });

      // Update Clerk user name
      await updateClerkUserName(id, data.name);

      return { success: true, error: false, msg: "Doctor created successfully" };
    }

    // If doctor exists, update it
    console.log("Doctor exists, updating record");
    
    // Prepare doctor data for DB with state_licensure
    const doctorDbData: any = {
      email: data.email,
      name: data.name,
      specialization: data.specialization,
      license_number: data.license_number,
      phone: data.phone,
      address: data.address,
      type: data.type,
      city: data.city,
      state: data.state,
      zip: data.zip,
      npi_number: data.npi_number,
      years_in_practice: data.years_in_practice,
      state_licensure: data.state_licensure || [], // Add state_licensure field
    };

    // Update doctor and working days in a transaction
    await db.$transaction(async (prisma) => {
      // Update the doctor record
      await prisma.doctor.update({
        where: { id },
        data: doctorDbData,
      });

      // Handle working days update
      if (data.working_days) {
        // Delete existing working days
        await prisma.workingDays.deleteMany({
        where: { doctor_id: id }
      });

        // Create new working days if any are provided
      if (data.working_days.length > 0) {
          const workingDaysData = data.working_days.map((day: any) => ({
            doctor_id: id,
            day: day.day,
            start_time: day.start_time,
            close_time: day.close_time || day.end_time,
          }));

          await prisma.workingDays.createMany({
            data: workingDaysData,
        });
      }
    }
    });

    // Update Clerk user name
    await updateClerkUserName(id, data.name);

    return { success: true, error: false, msg: "Doctor updated successfully" };
  } catch (error: any) {
    console.error("Doctor update error:", error);
    
    if (error.code === 'P2025') {
      return { success: false, error: true, msg: "Doctor record not found" };
    }
    
    if (error.message?.includes('WorkingDays')) {
      return { success: false, error: true, msg: "Error updating working schedule. Please try again." };
    }
    
    return { success: false, error: true, msg: error?.message || "Failed to update doctor" };
  }
}

// Helper function to update Clerk user name
async function updateClerkUserName(userId: string, fullName: string) {
  try {
    const client = await clerkClient();
    let firstName = fullName;
    let lastName = '';
    
    if (fullName && fullName.includes(' ')) {
      const [first, ...rest] = fullName.trim().split(' ');
      firstName = first;
      lastName = rest.join(' ');
    }
    
    await client.users.updateUser(userId, {
        firstName,
        lastName,
      });
    } catch (clerkError) {
      console.error('Failed to update Clerk user name:', clerkError);
      // Don't fail the entire update if Clerk update fails
  }
}