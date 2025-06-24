"use server";

import db from "@/lib/db";
import {
  DoctorSchema,
  ServicesSchema,
  WorkingDaysSchema,
} from "@/lib/schema";
import { generateRandomColor } from "@/utils";
import { checkRole } from "@/utils/roles";
import { auth, clerkClient } from "@clerk/nextjs/server";

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

    const client = await clerkClient();

    const user = await client.users.createUser({
      emailAddress: [validatedValues.email],
      password: validatedValues.password,
      firstName: validatedValues.name.split(" ")[0],
      lastName: validatedValues.name.split(" ")[1],
      publicMetadata: { role: "doctor" },
    });

    delete validatedValues["password"];

    const doctor = await db.doctor.create({
      data: {
        ...validatedValues,
        id: user.id,
        city: validatedValues.city,
        state: validatedValues.state,
        zip: validatedValues.zip,
        npi_number: validatedValues.npi_number,
        years_in_practice: validatedValues.years_in_practice,
      },
    });

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
    console.error("Full error object:", error);
    if (error && error.errors) {
      try {
        console.error("Clerk errors:", JSON.stringify(error.errors, null, 2));
      } catch (e) {
        console.error("Clerk errors (raw):", error.errors);
      }
    }
    return { success: false, error: true, msg: error?.message || (error.errors && JSON.stringify(error.errors)) };
  }
}

export async function addNewService(data: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const isValidData = ServicesSchema.safeParse(data);
    if (!isValidData.success) {
      return { success: false, msg: "Invalid data provided" };
    }

    const validatedData = isValidData.data;
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const providerName = clerkUser?.firstName && clerkUser?.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser?.firstName || clerkUser?.lastName || "Provider";

    await db.services.create({
      data: {
        ...validatedData,
        price: Number(data.price!),
        providerName,
        doctor: {
          connect: {
            id: userId
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