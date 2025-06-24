'use client';
import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stats-summary";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import DashboardCardsClient from "../../app/(protected)/admin/dashboard-cards-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import React from "react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function AnimatedDashboard({ result, isAdmin = false, userId = "" }: { result: any, isAdmin?: boolean, userId?: string }) {
  if ("success" in result && result.success) {
    const {
      availableDoctors = [],
      last5Records = [],
      appointmentCounts = {},
      monthlyData = [],
      totalDoctors = 0,
      totalPatient = 0,
      totalAppointments = 0,
      revenue = [],
      patientGrowth = [],
      recentPatients = [],
      recentDoctors = [],
      notifications = [],
      systemHealth = {},
    } = result;

    const cardData = [
      { title: "Patients", value: totalPatient ?? 0, iconKey: "users" as const, note: "Total patients", link: "/manage-patients" },
      { title: "Doctors", value: totalDoctors ?? 0, iconKey: "user" as const, note: "Total doctors", link: "/manage-doctors" },
      { title: "Appointments", value: totalAppointments ?? 0, iconKey: "briefcaseBusiness" as const, note: "Total appointments", link: "/manage-appointments" },
      { title: "Consultation", value: appointmentCounts?.COMPLETED ?? 0, iconKey: "briefcaseMedical" as const, note: "Total consultation", link: "/manage-appointments" },
    ];

    return (
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 px-3 md:px-6 py-4 md:py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* LEFT: Main Content */}
        <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6">
          {/* Greeting & Quick Actions */}
          <Card className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-br from-white to-gray-50/50 shadow-lg rounded-xl">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 drop-shadow-sm font-sans tracking-tight">
                <span className="font-semibold text-gray-700">{getGreeting()},</span> <span className="font-extrabold text-gray-900">Admin</span>
              </h1>
              <p className="text-gray-500 text-base mt-1">
                Here's your admin dashboard. Wishing you a productive day!
              </p>
            </div>
          </Card>
          {/* Summary Cards */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <DashboardCardsClient cardData={cardData} />
          </motion.div>
          {/* Appointment Chart - no card or background */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} style={{ minHeight: 420 }}>
            <AppointmentChart data={monthlyData} />
          </motion.div>
          {/* Recent Appointments - no card or background */}
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} style={{ minHeight: 320 }}>
            <RecentAppointments data={last5Records} isAdmin={isAdmin} userId={userId} />
          </motion.div>
          {/* Recent Doctors Coming Soon (still below) */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white rounded-xl p-4 shadow-lg">
            <div className="h-40 flex items-center justify-center text-gray-400">Recent Doctors Coming Soon</div>
          </motion.div>
        </div>
        {/* RIGHT: Info Panels */}
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <StatSummary data={appointmentCounts} total={totalAppointments ?? 0} />
          </motion.div>
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <AvailableDoctors data={availableDoctors} isAdmin={isAdmin} />
          </motion.div>
          {/* Revenue Chart */}
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white rounded-xl p-4 shadow-lg">
            <div className="h-64 flex items-center justify-center text-gray-400">Revenue Chart Coming Soon</div>
          </motion.div>
          {/* Recent Patients Coming Soon moved here */}
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="bg-white rounded-xl p-4 shadow-lg">
            <div className="h-40 flex items-center justify-center text-gray-400">Recent Patients Coming Soon</div>
          </motion.div>
        </div>
      </motion.div>
    );
  } else {
    return <div>Error loading dashboard: {"message" in result ? result.message : "Unknown error"}</div>;
  }
} 