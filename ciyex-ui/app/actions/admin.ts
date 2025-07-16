"use server";

import db from "@/lib/db";
import {
  DoctorSchema,
  ServicesSchema,
  WorkingDaysSchema,
} from "@/lib/schema";
import { generateRandomColor } from "@/utils";

// Clerk-free createNewDoctor
export async function createNewDoctor(data: any) {
  try {
    const values = DoctorSchema.safeParse(data);
    const workingDaysValues = WorkingDaysSchema.safeParse(data?.work_schedule);

    if (!values.success || !workingDaysValues.success) {
      return {
        success: false,
        errors: true,
        message: "Please provide all required info",
      };
    }

    const validatedValues = values.data;
    const workingDayData = workingDaysValues.data!;

    // Remove password before DB write (never store plaintext passwords!)
    delete validatedValues["password"];

    // Create doctor in database (generate ID if not provided)
    const doctor = await db.doctor.create({
      data: {
        ...validatedValues,
        // id: ...  // if you want to generate a UUID, use: id: uuidv4(),
        city: validatedValues.city,
        state: validatedValues.state,
        zip: validatedValues.zip,
        npi_number: validatedValues.npi_number,
        years_in_practice: validatedValues.years_in_practice,
      },
    });

    // Create working days for the doctor
    await Promise.all(
        workingDayData?.map((el) =>
            db.workingDays.create({
              data: { ...el, doctor_id: doctor.id },
            })
        )
    );

    return {
      success: true,
      message: "Doctor added successfully",
      error: false,
    };
  } catch (error: any) {
    console.error("Error creating doctor:", error);
    return { success: false, error: true, msg: error?.message };
  }
}

// Clerk-free addNewService
export async function addNewService(data: any, doctorId: string, doctorName: string) {
  try {
    // You must pass doctorId and doctorName from JWT/user session
    if (!doctorId) {
      return { success: false, msg: "Unauthorized" };
    }

    const isValidData = ServicesSchema.safeParse(data);
    if (!isValidData.success) {
      return { success: false, msg: "Invalid data provided" };
    }

    const validatedData = isValidData.data;
    const providerName = doctorName || "Provider";

    await db.services.create({
      data: {
        ...validatedData,
        price: Number(data.price!),
        providerName,
        doctor: {
          connect: {
            id: doctorId
          }
        }
      },
    });

    return {
      success: true,
      error: false,
      msg: `Service added successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}
