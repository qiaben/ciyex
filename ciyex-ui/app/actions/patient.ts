"use server";

import db from "@/lib/db";
import { PatientFormSchema } from "@/lib/schema";
import { clerkClient } from "@clerk/nextjs/server";

export async function updatePatient(data: any, pid: string) {
  try {
    console.log("Starting patient update with data:", data);
    console.log("Patient ID:", pid);

    const validateData = PatientFormSchema.safeParse(data);

    if (!validateData.success) {
      console.error("Validation error:", validateData.error);
      return {
        success: false,
        error: true,
        msg: validateData.error.message || "Provide all required fields",
      };
    }

    const patientData = validateData.data;

    // Update patient in database
    const updatedPatient = await db.patient.update({
      where: { id: pid },
      data: {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        date_of_birth: patientData.date_of_birth,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email,
        height: patientData.height,
        weight: patientData.weight,
        address: patientData.address,
        emergency_contact_name: patientData.emergency_contact_name,
        emergency_contact_number: patientData.emergency_contact_number,
        relation: patientData.relation,
        marital_status: patientData.marital_status || "SINGLE",
        blood_group: patientData.blood_group,
        allergies: patientData.allergies,
        medical_conditions: patientData.medical_conditions,
        medical_history: patientData.medical_history,
        insurance_provider: patientData.insurance_provider,
        insurance_number: patientData.insurance_number,
        privacy_consent: Boolean(patientData.privacy_consent),
        service_consent: Boolean(patientData.service_consent),
        medical_consent: Boolean(patientData.medical_consent),
        city: patientData.city,
        state: patientData.state,
        zip_code: patientData.zip_code,
        preferred_contact_method: patientData.preferred_contact_method,
        preferred_appointment_type: patientData.preferred_appointment_type,
        img: patientData.img,
      },
    });

    console.log("Database update successful:", updatedPatient);

    // Update user data in Clerk
    try {
      const client = await clerkClient();
      await client.users.updateUser(pid, {
        firstName: patientData.first_name,
        lastName: patientData.last_name,
        publicMetadata: { 
          role: "patient",
          status: "active"
        },
      });
      console.log("Clerk user update successful");
    } catch (clerkError) {
      console.error("Error updating Clerk user:", clerkError);
      // Continue even if Clerk update fails, as the database update was successful
    }

    return { 
      success: true, 
      error: false, 
      msg: "Patient updated successfully",
      data: updatedPatient
    };
  } catch (error: any) {
    console.error("Error updating patient:", error);
    if (error?.errors) {
      // Handle Clerk-specific errors
      return { 
        success: false, 
        error: true, 
        msg: error.errors.map((e: any) => e.message).join(", ") 
      };
    }
    return { 
      success: false, 
      error: true, 
      msg: error?.message || "Failed to update patient" 
    };
  }
}

export async function createNewPatient(data: any, userId: string) {
  try {
    console.log("=== CREATE NEW PATIENT DEBUG ===");
    console.log("Received data:", data);
    console.log("Received userId:", userId);
    
    if (!userId) {
      console.log("No userId provided");
      return {
        success: false,
        error: true,
        msg: "User ID is required",
      };
    }

    console.log("Validating data with schema...");
    const validateData = PatientFormSchema.safeParse(data);

    if (!validateData.success) {
      console.log("Validation failed:", validateData.error);
      return {
        success: false,
        error: true,
        msg: validateData.error.message || "Provide all required fields",
      };
    }

    console.log("Validation successful, data:", validateData.data);
    const patientData = validateData.data;

    // First check if patient already exists
    console.log("Checking if patient already exists...");
    const existingPatient = await db.patient.findUnique({
      where: { id: userId }
    });

    if (existingPatient) {
      console.log("Patient already exists:", existingPatient);
      return {
        success: false,
        error: true,
        msg: "A patient profile already exists for this user",
      };
    }

    console.log("No existing patient found, proceeding with creation...");
    const client = await clerkClient();
    
    try {
      // First check if user exists
      console.log("Checking if user exists in Clerk...");
      const existingUser = await client.users.getUser(userId);
      if (!existingUser) {
        console.log("User not found in Clerk");
        return {
          success: false,
          error: true,
          msg: "User not found. Please sign in again.",
        };
      }

      console.log("User found in Clerk, updating metadata...");
      // Update user metadata
      await client.users.updateUser(userId, {
        firstName: patientData.first_name,
        lastName: patientData.last_name,
        publicMetadata: { 
          role: "patient",
          status: "active"
        },
      });
      console.log("Clerk user metadata updated successfully");
    } catch (error) {
      console.error("Error with Clerk user:", error);
      return {
        success: false,
        error: true,
        msg: "Error updating user information. Please try again.",
      };
    }

    // Create patient record
    console.log("Creating patient record in database...");
    try {
      const newPatient = await db.patient.create({
        data: {
          id: userId,
          first_name: patientData.first_name,
          last_name: patientData.last_name,
          date_of_birth: patientData.date_of_birth,
          gender: patientData.gender,
          phone: patientData.phone,
          email: patientData.email,
          height: patientData.height,
          weight: patientData.weight,
          address: patientData.address,
          emergency_contact_name: patientData.emergency_contact_name,
          emergency_contact_number: patientData.emergency_contact_number,
          relation: patientData.relation,
          marital_status: patientData.marital_status || "SINGLE",
          blood_group: patientData.blood_group,
          allergies: patientData.allergies,
          medical_conditions: patientData.medical_conditions,
          medical_history: patientData.medical_history,
          insurance_provider: patientData.insurance_provider,
          insurance_number: patientData.insurance_number,
          privacy_consent: Boolean(patientData.privacy_consent),
          service_consent: Boolean(patientData.service_consent),
          medical_consent: Boolean(patientData.medical_consent),
          city: patientData.city,
          state: patientData.state,
          zip_code: patientData.zip_code,
          preferred_contact_method: patientData.preferred_contact_method,
          preferred_appointment_type: patientData.preferred_appointment_type,
          img: patientData.img,
        },
      });

      console.log("Patient created successfully:", newPatient);

      return { 
        success: true, 
        error: false, 
        msg: "Patient created successfully",
        userId: userId 
      };
    } catch (error: any) {
      console.error("Error creating patient record:", error);
      if (error.code === 'P2002') {
        return {
          success: false,
          error: true,
          msg: "A patient with this email already exists",
        };
      }
      return {
        success: false,
        error: true,
        msg: error?.message || "Failed to create patient record",
      };
    }
  } catch (error: any) {
    console.error("Error in createNewPatient:", error);
    if (error?.errors) {
      return { 
        success: false, 
        error: true, 
        msg: error.errors.map((e: any) => e.message).join(", ") 
      };
    }
    return { 
      success: false, 
      error: true, 
      msg: error?.message || "Failed to create patient" 
    };
  }
}