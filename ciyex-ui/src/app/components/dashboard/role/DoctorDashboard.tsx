"use client";

import ProviderGreeting from "@/components/dashboard/ProviderGreeting";
import SummaryCards from "@/components/dashboard/SummaryCards";
import StatisticsOverview from "@/components/dashboard/StatisticsOverview";
import RevenueByService from "@/components/dashboard/RevenueByService";
import RecentPatients from "@/components/dashboard/RecentPatients";
import RecentAppointments from "@/components/dashboard/RecentAppointments";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";

export default function DoctorDashboard() {
    return (
        <div className="dashboard-container px-6 py-6" style={{ backgroundColor: "#f9f7f3", minHeight: "100vh" }}>
            {/* Greeting Section */}
            <ProviderGreeting />

            {/* Spacer after greeting */}
            <div style={{ height: "40px" }} />

            {/* Summary Cards + Statistics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="grid grid-cols-2 gap-4 col-span-2">
                    <SummaryCards />
                </div>
                <StatisticsOverview />
            </div>

            {/* Spacer between sections */}
            <div style={{ height: "40px" }} />

            {/* Revenue by Service & Recent Patients */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueByService />
                <RecentPatients />
            </div>

            {/* Spacer between sections */}
            <div style={{ height: "40px" }} />

            {/* Upcoming & Recent Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingAppointments />
                <RecentAppointments />
            </div>
        </div>
    );
}
