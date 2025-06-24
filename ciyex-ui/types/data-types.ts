import { AppointmentStatus, Doctor, Patient } from "@prisma/client";

export interface AppointmentChartData {
  name: string;
  appointment: number;
  completed: number;
  date: string;
}

export type AppointmentsChartProps = AppointmentChartData[];

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  type: string;
  appointment_date: Date;
  time: string;
  status: AppointmentStatus;

  patient: Patient;
  doctor: Doctor;
};

export type AvailableDoctorProps = {
  id: string;
  name: string;
  specialization: string;
  img?: string;
  colorCode?: string;
  working_days: {
    day: string;
    start_time: string;
    close_time: string;
  }[];
}[];