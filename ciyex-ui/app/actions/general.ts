"use server";

import db from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { RatingFormValues, ratingSchema } from "@/app/types/rating";

export async function deleteDataById(
  id: string,
  deleteType: "doctor" | "patient" | "payment" | "bill"
) {
  try {
    switch (deleteType) {
      case "doctor":
        await db.doctor.delete({ where: { id: id } });
      case "patient":
        await db.patient.delete({ where: { id: id } });
      case "payment":
        await db.payment.delete({ where: { id: Number(id) } });
    }

    if (
      deleteType === "patient" ||
      deleteType === "doctor"
    ) {
      const client = await clerkClient();
      await client.users.deleteUser(id);
    }

    return {
      success: true,
      message: "Data deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createReview(values: any) {
  try {
    // TODO: Implement lab test review logic here
    return {
      success: false,
      message: "Lab test review not implemented",
      status: 501,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createRating(values: RatingFormValues) {
  try {
    const validatedFields = ratingSchema.parse(values);
    await db.rating.create({
      data: {
        patient_id: validatedFields.patient_id,
        staff_id: validatedFields.staff_id,
        rating: validatedFields.rating,
        comment: validatedFields.comment,
      },
    });
    return {
      success: true,
      message: "Rating created successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}