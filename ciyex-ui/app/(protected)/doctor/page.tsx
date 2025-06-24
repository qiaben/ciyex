import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stats-summary";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { Button } from "@/components/ui/button";
import { checkRole, getRole } from "@/utils/roles";
import { getDoctorDashboardStats } from "@/utils/services/doctor";
import { getDoctorRatings } from "@/utils/services/rating";
import { currentUser } from "@clerk/nextjs/server";
import { BriefcaseBusiness, BriefcaseMedical, Star, User, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import { DashboardCardsClient } from "./dashboard-cards-client";
import { ProfileImage } from "@/components/profile-image";
import  RecentPatientsClient  from "./recent-patients-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import DoctorRevenueChart, { RevenueDatum } from '@/components/charts/DoctorRevenueChart';
import DoctorServiceRevenuePieChart from '@/components/charts/DoctorServiceRevenuePieChart';
import { Patient } from "@/lib/generated/prisma";
// import type { Patient } from "@/types/patient";

interface RecentPatientsClientProps {
  patients: Patient[];        // current/upcoming patients
  allPatients: Patient[];     // all patients ever had
}

const DoctorDashboard = async () => {
  const user = await currentUser();

  // Add status/role check
  const status = user?.publicMetadata?.status;
  const role = user?.publicMetadata?.role;
  if (role === 'doctor' && status !== 'approved') {
    redirect('/doctor-registration/pending');
  }

  const {
    totalAppointment,
    appointmentCounts,
    availableDoctors,
    monthlyData,
    last5Records,
    appointments,
    serviceRevenue,
    totalRevenue,
    monthlyRevenueData,
  } = await getDoctorDashboardStats(user?.id!);

  // Get ratings for the current doctor
  const ratings = await getDoctorRatings(user?.id!);
  const averageRating = ratings.length > 0
    ? ratings.reduce((acc: any, curr: any) => acc + curr.rating, 0) / ratings.length
    : 0;

  // Only count unique patients who have at least one appointment (any status) with this doctor
  const patientsWithAnyAppointment = (appointments || [])
    .filter((a: any) => a.patient)
    .map((a: any) => a.patient.id);
  const uniquePatientIds = Array.from(new Set(patientsWithAnyAppointment));
  const totalPatient = uniquePatientIds.length;

  // Find patients with a current or upcoming appointment (status SCHEDULED and appointment_date >= today)
  const now = new Date();
  const scheduledAppointments = (appointments || []).filter((a: any) => {
    return a.status === 'SCHEDULED' && new Date(a.appointment_date) >= now && a.patient;
  });
  // Deduplicate patients by id for scheduled appointments
  const patientMap = new Map();
  scheduledAppointments.forEach((a: any) => {
    if (a.patient && !patientMap.has(a.patient.id)) {
      patientMap.set(a.patient.id, a.patient);
    }
  });
  const patients = Array.from(patientMap.values());

  // Get all unique patients from all appointments (for allPatients, if needed elsewhere)
  const allPatientMap = new Map();
  (appointments || []).forEach((a: any) => {
    if (a.patient && !allPatientMap.has(a.patient.id)) {
      allPatientMap.set(a.patient.id, a.patient);
    }
  });
  const allPatients = Array.from(allPatientMap.values());

  const cardData = [
    {
      title: "Patients",
      value: totalPatient ?? 0,
      iconKey: "users",
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total patients",
      link: "/record/patients",
    },
    {
      title: "Appointments",
      value: totalAppointment ?? 0,
      pending: appointmentCounts?.PENDING ?? 0,
      iconKey: "briefcaseBusiness",
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Successful appointments",
      link: "/record/appointments",
    },
    {
      title: "Consultation",
      value: appointmentCounts?.COMPLETED ?? 0,
      iconKey: "briefcaseMedical",
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Total consultation",
      link: "/record/appointments",
    },
    {
      title: "Revenue",
      value: `$${(totalRevenue ?? 0).toFixed(2)}`,
      iconKey: "star",
      className: "bg-amber-600/15",
      iconClassName: "bg-amber-600/25 text-amber-600",
      note: `${(serviceRevenue ?? []).length} services`,
      link: `/record/billing`,
    },
  ];

  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening";

  // Find the last completed appointment and count
  const completedAppointments = (appointments || []).filter((a: any) => a.status === 'COMPLETED');
  const lastCompleted = completedAppointments.sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-[#0f172a] dark:to-[#134e4a] rounded-xl py-6 px-3 flex flex-col xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%] flex flex-col h-full">
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg p-6 mb-8 border border-[#10b981]/10 dark:border-[#10b981]/20 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e293b] dark:text-white drop-shadow-sm font-sans tracking-tight">
                <span className="font-semibold text-[#10b981] dark:text-[#5eead4]">{greeting},</span> <span className="font-extrabold text-[#2563eb] dark:text-[#38bdf8]">Dr. {user?.firstName}</span>
              </h1>
              <p className="text-[#64748b] dark:text-gray-300 text-base mt-1">
                Here's your dashboard. Wishing you a productive day!
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2563eb] dark:border-[#38bdf8] text-[#2563eb] dark:text-[#38bdf8] font-semibold text-sm bg-white dark:bg-[#134e4a] hover:bg-[#e0f2fe] dark:hover:bg-[#164e63] hover:text-[#2563eb] dark:hover:text-[#5eead4] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 dark:focus:ring-[#38bdf8]/30"
            >
              <Link href={`/record/doctors/${user?.id}`}>
                <User className="w-4 h-4 mr-1" />
                View Profile
              </Link>
            </Button>
          </div>
          <div className="flex-1 flex flex-col justify-between">
          <DashboardCardsClient cardData={cardData} />
          </div>
        </div>

        <div className="h-[500px]">
          <AppointmentChart data={monthlyData!} />
        </div>

        <div className="mt-8">
          <RecentAppointments data={last5Records!} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[31%] flex flex-col gap-4 h-full justify-between">
        {/* Classy 3D Button for Last Completed Appointment */}
        {completedAppointments.length > 0 && lastCompleted && (
          <Link href={`/record/appointments/${lastCompleted.id}`} className="block mb-4 group focus:outline-none">
            <div className="relative bg-gradient-to-br from-white via-[#f0fdfa] to-[#e0f2fe] dark:from-[#1e293b] dark:via-[#134e4a] dark:to-[#0f172a] shadow-xl rounded-2xl p-7 flex flex-col items-start justify-between min-h-[120px] border border-[#e0e7ef] dark:border-[#134e4a] transition-all duration-300 group-hover:scale-[1.03] group-active:scale-98 group-hover:shadow-2xl cursor-pointer overflow-hidden animate-fadeInUp backdrop-blur-xl">
              <div className="absolute inset-0 bg-white/30 dark:bg-[#0f172a]/40 rounded-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-1 w-full">
                <span className="text-xs font-semibold text-[#2563eb] dark:text-[#5eead4] tracking-widest uppercase mb-1">Last Completed Appointment</span>
                <span className="text-xl font-bold text-[#1e293b] dark:text-white leading-tight flex items-center gap-2">
                  {lastCompleted.patient?.first_name} {lastCompleted.patient?.last_name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                  <svg width="16" height="16" fill="none" className="inline-block mr-1"><circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="2" fill="none" /></svg>
                  {new Date(lastCompleted.appointment_date).toLocaleDateString()} &middot; {lastCompleted.doctor?.specialization || 'Consultation'}
                </span>
                <span className="mt-3 inline-block px-4 py-2 rounded-lg bg-[#10b981]/90 dark:bg-[#2563eb]/80 text-white text-sm font-semibold shadow hover:bg-[#2563eb]/90 dark:hover:bg-[#10b981]/90 transition-all duration-200 border border-transparent hover:border-[#10b981] dark:hover:border-[#5eead4]">View Report &rarr;</span>
              </div>
            </div>
          </Link>
        )}
            <div className="animate-fadeInUp transition-all duration-300 hover:scale-[1.02]">
              <StatSummary data={appointmentCounts} total={totalAppointment!} />
            </div>
        {/* <div className="mt-6 animate-fadeInUp transition-all duration-300 hover:scale-[1.01] flex-1 flex flex-col"> */}
          <div className="mt-8">
            <DoctorServiceRevenuePieChart serviceRevenue={(serviceRevenue ?? []).map(s => ({ ...s, id: String(s.id) }))} />
          </div>
        {/* </div> */}

        {/* Recent Patients Card */}
        <RecentPatientsClient patients={patients} allPatients={allPatients} />
      </div>
    </div>
  );
};

export default DoctorDashboard;