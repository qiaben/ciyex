import { z } from "zod";

export const PatientFormSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name can't be more than 50 characters"),
  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(30, "First name can't be more than 50 characters"),
  date_of_birth: z.coerce.date().max(new Date(), { message: "Date of birth cannot be in the future." }),
  height: z.coerce.number().min(0, "Height must be a positive number"),
  weight: z.coerce.number().min(0, "Weight must be a positive number"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(5, "Zip code must be at least 5 characters"),
  preferred_contact_method: z.enum(["Email", "Phone", "Text"], { 
    required_error: "Please select a preferred contact method" 
  }),
  preferred_appointment_type: z.enum(["In-person", "Visual", "Both"], { 
    required_error: "Please select a preferred appointment type" 
  }),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], { 
    required_error: "Gender is required" 
  }),
  phone: z.string().min(10, "Enter phone number").max(10, "Enter phone number"),
  email: z.string().email("Invalid email address."),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),
  emergency_contact_name: z
    .string()
    .min(2, "Emergency contact name is required.")
    .max(50, "Emergency contact must be at most 50 characters"),
  emergency_contact_number: z
    .string()
    .min(10, "Enter phone number")
    .max(10, "Enter phone number"),
  relation: z.enum(["mother", "father", "husband", "wife", "other"], {
    required_error: "Relations with contact person required",
  }),
  marital_status: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], {
    required_error: "Marital status is required",
  }),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  medical_history: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_number: z.string().optional(),
  privacy_consent: z
    .boolean()
    .default(false)
    .refine((val) => val === true, {
      message: "You must agree to the privacy policy.",
    }),
  service_consent: z
    .boolean()
    .default(false)
    .refine((val) => val === true, {
      message: "You must agree to the terms of service.",
    }),
  medical_consent: z
    .boolean()
    .default(false)
    .refine((val) => val === true, {
      message: "You must agree to the medical treatment terms.",
    }),
  img: z.string().optional(),
  year_of_registration: z.string().min(4, 'Year is required').max(4, 'Year is required').regex(/^\d{4}$/, 'Year must be a 4-digit number'),
});


export const AppointmentSchema = z.object({
    doctor_id: z.string().min(1, "Select physician"),
    type: z.string().min(1, "Select type of appointment"),
    appointment_date: z.string().min(1, "Select appointment date"),
    time: z.string().min(1, "Select appointment time"),
    mode: z.string().min(1, "Select appointment mode"),
    note: z.string().optional(),
  });

// Duplicate of AppointmentSchema for Patient Intake Form, with additional intake fields
export const PatientIntakeSchema = z.object({
  appointment_date: z.string().min(1, "Appointment date is required"),
  time: z.string().min(1, "Appointment time is required"),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  pastMedicalConditions: z.string().optional(),
  bloodPressure: z.string().optional(),
  temperature: z.string().optional(),
  pharmacyName: z.string().optional(),
  pharmacyAddress: z.string().optional(),
  pharmacyPhone: z.string().optional(),
});

  
export const DoctorSchema = z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    phone: z.string().min(10, "Enter phone number").max(10, "Enter phone number"),
    email: z.string().email("Invalid email address."),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(500, "Address must be at most 500 characters"),
    specialization: z.string().min(2, "Specialization is required."),
    license_number: z.string().min(2, "License number is required"),
    type: z.enum(["FULL", "PART"], { message: "Type is required." }),
    department: z.string().min(2, "Department is required."),
    img: z.string().optional(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long!" })
      .optional()
      .or(z.literal("")),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "Zip is required"),
    npi_number: z.string().min(1, "NPI number is required"),
    years_in_practice: z.string().min(1, "Years in practice is required"),
  });
  
  export const workingDaySchema = z.object({
    day: z.enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]),
    start_time: z.string(),
    close_time: z.string(),
  });
  export const WorkingDaysSchema = z.array(workingDaySchema).optional();
  
  
  export const VitalSignsSchema = z.object({
    patient_id: z.string(),
    medical_id: z.string(),
    body_temperature: z.coerce.number({
      message: "Enter recorded body temperature",
    }),
    heartRate: z.string({ message: "Enter recorded heartbeat rate" }),
    systolic: z.coerce.number({
      message: "Enter recorded systolic blood pressure",
    }),
    diastolic: z.coerce.number({
      message: "Enter recorded diastolic blood pressure",
    }),
    respiratory_rate: z.coerce.number().optional(),
    oxygen_saturation: z.coerce.number().optional(),
    weight: z.coerce.number({ message: "Enter recorded weight (Kg)" }),
    height: z.coerce.number({ message: "Enter recorded height (Cm)" }),
  });
  
  export const DiagnosisSchema = z.object({
    patient_id: z.string(),
    medical_id: z.string(),
    doctor_id: z.string(),
    symptoms: z.string({ message: "Symptoms required" }),
    diagnosis: z.string({ message: "Diagnosis required" }),
    notes: z.string().optional(),
    prescribed_medications: z.string().optional(),
    follow_up_plan: z.string().optional(),
  });
  
  export const PaymentSchema = z.object({
    id: z.string(),
    bill_date: z.coerce.date(),
  });
  
  export const PatientBillSchema = z.object({
    bill_id: z.string(),
    service_id: z.string(),
    service_date: z.string(),
    appointment_id: z.string(),
    quantity: z.string({ message: "Quantity is required" }),
    unit_cost: z.string({ message: "Unit cost is required" }),
    total_cost: z.string({ message: "Total cost is required" }),
  });
  
  export const ServicesSchema = z.object({
    service_name: z.string({ message: "Service name is required" }),
    price: z.string({ message: "Service price is required" }),
    description: z.string({ message: "Service description is required" }),
    isOnline: z.boolean().optional(),
    hospitalName: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    status: z.string().optional(),
    mode: z.string().optional(),
    category: z.string().optional(),
    insurance_accepted: z.array(z.string()).optional(),
  }).refine((data) => {
    if (data.isOnline === false) {
      return !!(data.hospitalName && data.address && data.city && data.state && data.zipCode);
    }
    return true;
  }, {
    message: "All location fields are required for in-person services",
    path: ["hospitalName"]
  });