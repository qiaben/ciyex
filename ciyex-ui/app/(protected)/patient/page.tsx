import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stats-summary";
import { PatientRatingContainer } from "@/components/patient-rating-container";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { Button } from "@/components/ui/button";
import { AvailableDoctorProps } from "@/types/data-types";
import { getPatientDashboardStatistics } from "@/utils/services/patient";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export const revalidate = 60;

const PatientDashboard = async () => {
  const user = await currentUser();

  const {
    data,
    appointmentCounts = {} as Record<string, number>,
    last5Records = [],
    totalAppointments = 0,
    availableDoctor = [],
    monthlyData = [],
  } = await getPatientDashboardStatistics(user?.id!) ?? {};

  // Provide default values for appointmentCounts properties
  const CANCELLED = appointmentCounts.CANCELLED ?? 0;
  const PENDING = appointmentCounts.PENDING ?? 0;
  const SCHEDULED = appointmentCounts.SCHEDULED ?? 0;
  const COMPLETED = appointmentCounts.COMPLETED ?? 0;

  if (user && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="mb-4">We couldn't find your patient profile. Please complete your registration or contact support if you believe this is an error.</p>
          <Button asChild>
            <Link href="/patient/registration">Go to Registration</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const cardData = [
    {
      title: "appointments",
      value: totalAppointments,
      icon: Briefcase,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total appointments",
    },
    {
      title: "cancelled",
      value: CANCELLED,
      icon: Briefcase,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Cancelled Appointments",
    },
    {
      title: "pending",
      value: PENDING + SCHEDULED,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Pending Appointments",
    },
    {
      title: "completed",
      value: COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Successfully appointments",
    },
  ];

  return (
    <div className="py-2 px-1 sm:py-4 sm:px-3 min-h-screen bg-background">
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 xl:gap-8">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Welcome + Stats */}
          <div className="relative bg-card rounded-xl shadow-sm border border-border p-4 overflow-hidden animate-fadeInUp transition-all duration-300 hover:scale-[1.02] w-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-muted to-muted rounded-t-xl z-10" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-2">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-muted to-muted-foreground flex items-center justify-center shadow-sm border border-border">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8.5V6.75A2.25 2.25 0 019.25 4.5h.5A2.25 2.25 0 0112 6.75V8.5m0 0v2.25m0-2.25h2.25A2.25 2.25 0 0116.5 10.75v.5A2.25 2.25 0 0114.25 13.5H12m0 0v2.25m0-2.25H9.75A2.25 2.25 0 017.5 11.25v-.5A2.25 2.25 0 019.75 8.5H12z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl xl:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                    Welcome, {data?.first_name || user?.firstName}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" className="rounded-full border border-border bg-card text-foreground font-semibold px-5 py-2 flex items-center gap-2 shadow-sm hover:bg-muted transition text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12z" />
                  </svg>
                  {new Date().getFullYear()}
                </Button>
                <Button size="sm" variant="outline" className="rounded-full border-border text-foreground font-semibold px-5 py-2 flex items-center gap-2 hover:bg-muted transition text-base">
                  <Link href="/patient/self" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0v.25a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.25z" />
                    </svg>
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>
            <div className="w-full flex flex-wrap gap-5">
              {cardData?.map((el, id) => (
                <StatCard key={id} {...el} link="/record/appointments" />
              ))}
            </div>
          </div>
          {/* Chart Section */}
          <div className="h-[400px] md:h-[500px] animate-fadeInUp transition-all duration-300 hover:scale-[1.02] w-full">
            <AppointmentChart data={monthlyData} />
          </div>
          {/* Recent Appointments Section */}
          <div className="mt-8 animate-fadeInUp transition-all duration-300 hover:scale-[1.02] w-full">
            <RecentAppointments data={last5Records} />
          </div>
        </div>
        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4 items-stretch">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="animate-fadeInUp transition-all duration-300 hover:scale-[1.02]">
              <StatSummary data={appointmentCounts} total={totalAppointments} />
            </div>
            <div className="animate-fadeInUp transition-all duration-300 hover:scale-[1.02]">
              <AvailableDoctors data={availableDoctor as AvailableDoctorProps} />
            </div>
            <div className="animate-fadeInUp transition-all duration-300 hover:scale-[1.02]">
              <PatientRatingContainer id={user?.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
