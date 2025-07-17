"use server";

import db from "@/lib/db";
import { z } from "zod";
import { RatingFormValues, ratingSchema } from "@/app/types/rating";
import { getCurrentUserFromToken } from "../utils/auth";

// Function to delete data based on ID and type (doctor, patient, payment, bill)
export async function deleteDataById(
    id: string,
    deleteType: "doctor" | "patient" | "payment" | "bill"
) {
    try {
        switch (deleteType) {
            case "doctor":
                await db.doctor.delete({ where: { id } });
                break;
            case "patient":
                await db.patient.delete({ where: { id } });
                break;
            case "payment":
                await db.payment.delete({ where: { id: Number(id) } });
                break;
            // case "bill": // If you want to handle "bill", add logic here.
            //   break;
        }

        // Clerk user deletion removed!
        // If you want to delete users from your own users table, add it here.

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

// Function to create a lab test review (currently not implemented)
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

// Function to create a rating for staff based on validated fields
export async function createRating(values: RatingFormValues) {
    try {
        // Fetch current user from token to ensure user authorization
        const user = await getCurrentUserFromToken();
        if (!user) {
            return {
                success: false,
                message: "Unauthorized",
                status: 401,
            };
        }

        // Validate rating fields using Zod schema
        const validatedFields = ratingSchema.parse(values);

        // Create rating in the database
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
